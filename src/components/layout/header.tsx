"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import type { Profile } from "@/types/user";
import { useLanguage } from "@/lib/i18n/context";

interface HeaderProps {
  profile: Profile;
  onMenuClick?: () => void;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Header({ profile, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = getInitials(profile.full_name);

  return (
    <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
        <h1 className="text-lg font-semibold text-foreground lg:hidden">
          <span className="font-bold">Mirqo</span>
          <span className="font-light text-muted-foreground">lyzer</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="flex items-center gap-2.5 rounded-full px-2 py-1 hover:bg-foreground/5 transition-colors duration-150" />}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm ring-2 ring-primary/10">
              <span className="text-xs font-semibold text-primary-foreground leading-none">{initials}</span>
            </div>
            <span className="hidden sm:inline text-sm font-medium text-foreground">{profile.full_name || "Account"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-sm font-medium text-foreground truncate">{profile.full_name || "Account"}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{profile.plan} {t("common.plan")}</p>
            </div>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />{t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />{t("nav.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
