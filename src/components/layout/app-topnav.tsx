"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";
import { VisitorSearchDialog } from "@/components/layout/visitor-search-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignOutMenuItem } from "@/components/auth/sign-out-menu-item";
import type { Admin } from "@/lib/database.types";
import { dashboardNavItems, superAdminNavItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppTopNav({ admin }: { admin?: Admin | null }) {
  const pathname = usePathname();
  const displayName = admin?.name ?? "Admin";
  const initials = getInitials(displayName);
  const roleLabel = admin?.role === "super_admin" ? "Super admin" : "Admin";
  const navItems =
    admin?.role === "super_admin"
      ? [...dashboardNavItems, ...superAdminNavItems]
      : dashboardNavItems;

  const navLinks = navItems.filter((item) => item.href !== "/dashboard/nouveau");

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <header className="livento-topnav">
      <Link href="/dashboard" className="livento-topnav-brand">
        <Image
          src="/cir-logo.png"
          alt="Communauté Internationale de la Rédemption"
          width={40}
          height={40}
          className="livento-topnav-logo size-10 object-contain"
          priority
        />
      </Link>

      <nav className="livento-topnav-nav" aria-label="Navigation">
        {navLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "livento-topnav-link",
              isActive(item.href) && "livento-topnav-link-active",
            )}
          >
            {item.shortTitle}
          </Link>
        ))}
      </nav>

      <div className="livento-topnav-actions">
        <div className="livento-topnav-actions-group">
          <Link
            href="/dashboard/nouveau"
            className="dash-btn-primary dash-btn-primary-compact h-9 shrink-0 text-xs font-semibold"
            aria-label="Nouvelle personne"
          >
            Nouveau
          </Link>

          <VisitorSearchDialog />

          <button
            type="button"
            className="livento-action-btn livento-action-btn-icon livento-action-btn-notif"
            aria-label="Notifications"
          >
            <Bell className="size-[19px]" strokeWidth={1.75} />
            <span className="livento-notif-badge">3</span>
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="livento-user-menu">
            <Avatar className="livento-user-avatar">
              <AvatarFallback className="livento-user-avatar-fallback">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="livento-user-info">
              <span className="livento-user-name">{displayName}</span>
              <span className="livento-user-role">{roleLabel}</span>
            </div>
            <ChevronDown className="livento-user-chevron" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>

        <Sheet>
          <SheetTrigger
            className="livento-action-btn livento-action-btn-icon livento-topnav-menu-btn"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" strokeWidth={1.75} />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              <Link
                href="/dashboard/nouveau"
                className="dash-btn-primary dash-btn-primary-compact mb-4 inline-flex h-9 w-full items-center justify-center text-xs font-semibold"
              >
                Nouveau
              </Link>
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
