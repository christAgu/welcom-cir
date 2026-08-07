import { Suspense } from "react";
import { AuthConfirmClient } from "./auth-confirm-client";

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="livento-canvas flex min-h-screen items-center justify-center px-6">
          <p className="text-muted-foreground">Validation du lien…</p>
        </div>
      }
    >
      <AuthConfirmClient />
    </Suspense>
  );
}
