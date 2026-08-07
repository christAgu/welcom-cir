"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutMenuItem() {
  return (
    <DropdownMenuItem
      className="cursor-pointer gap-2"
      onClick={() => {
        window.location.assign("/auth/signout");
      }}
    >
      <LogOut className="size-4" />
      Se déconnecter
    </DropdownMenuItem>
  );
}
