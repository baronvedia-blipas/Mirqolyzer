"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import type { Profile } from "@/types/user";

interface MobileNavProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ profile, open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar profile={profile} />
      </SheetContent>
    </Sheet>
  );
}
