"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/auth/redirect";

export function AuthConfirmClient() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Validation du lien…");

  useEffect(() => {
    const supabase = createClient();
    const next = safeRedirectPath(searchParams.get("next"));
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    let cancelled = false;

    function finish(path: string) {
      if (cancelled) return;
      window.location.href = path;
    }

    function fail() {
      if (cancelled) return;
      finish("/login?error=auth_callback");
    }

    async function confirm() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          fail();
          return;
        }
        finish(next);
        return;
      }

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType,
        });
        if (error) {
          fail();
          return;
        }
        finish(next);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        finish(next);
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
          subscription.unsubscribe();
          finish(next);
        }
      });

      window.setTimeout(async () => {
        subscription.unsubscribe();
        const {
          data: { session: latestSession },
        } = await supabase.auth.getSession();
        if (latestSession) finish(next);
        else fail();
      }, 4000);
    }

    confirm().catch(() => {
      setMessage("Lien invalide ou expiré.");
      fail();
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="livento-canvas flex min-h-screen items-center justify-center px-6">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
