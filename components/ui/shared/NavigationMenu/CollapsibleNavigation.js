"use client";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import CollapsibleNavigationListItem from "@/components/ui/shared/NavigationMenu/CollapsibleNavigationListItem";
import { useContext } from "@/components/Context/Context";

export default function CollapsibleNavigation({
  type,
  navLinks,
  triggerTitle,
}) {
  const { isBurgerClickedSet } = useContext();

  const handleItemClick = () => {
    isBurgerClickedSet(false);
  };

  return (
    <NavigationMenu>
      <NavigationMenuList className={`${type === "mobile" ? "fcr" : ""}`}>
        <NavigationMenuItem>
          {triggerTitle && (
            <NavigationMenuTrigger className="miw125">
              {triggerTitle}
            </NavigationMenuTrigger>
          )}
          <NavigationMenuContent className="miw125">
            <ul className="fc g0 p15">
              {navLinks.map((component) => (
                <CollapsibleNavigationListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  onClick={handleItemClick}
                >
                  {component.description}
                </CollapsibleNavigationListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
