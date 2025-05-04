"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import HeaderNavigationMenu from "@/components/Nav/Header/HeaderNavigationMenu";
import { useContext } from "@/components/Context/Context";
import TwoStripeMenu from "@/components/ui/icons/TwoStripeMenu";

export default function CustomNavigation({ isAdmin }) {
  const { isBurgerClicked, isBurgerClickedSet } = useContext();

  const toggleMenu = () => isBurgerClickedSet(!isBurgerClicked);

  return (
    <div className="f aic hf">
      <Sheet open={isBurgerClicked} onOpenChange={isBurgerClickedSet}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground white"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open menu</span>
            {isBurgerClicked ? (
              <X className="scale-[2.4]" />
            ) : (
              <>
                <TwoStripeMenu className="scale-[2.4]" />
                <span className="a l60">MENU</span>
              </>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w320 bg_black"
          closeClassName="white"
        >
          <nav className="mt-6">
            <HeaderNavigationMenu type="custom" {...{ isAdmin }} />
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
