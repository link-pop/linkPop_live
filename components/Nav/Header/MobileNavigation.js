"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import HeaderNavigationMenu from "@/components/Nav/Header/HeaderNavigationMenu";
import { useContext } from "@/components/Context/Context";

export default function MobileNavigation({ isAdmin }) {
  const { isBurgerClicked, isBurgerClickedSet } = useContext();

  const toggleMenu = () => isBurgerClickedSet(!isBurgerClicked);

  return (
    <div className="abounce mla">
      <Sheet open={isBurgerClicked} onOpenChange={isBurgerClickedSet}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open menu</span>
            {isBurgerClicked ? (
              <X className="scale-[2.0]" />
            ) : (
              <Menu className="scale-[2.0]" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="oya bg-white max-w-[360px] wf">
          <nav className="mt-6 mra fz20">
            <HeaderNavigationMenu type="mobile" {...{ isAdmin }} />
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
