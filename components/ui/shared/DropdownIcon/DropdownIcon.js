"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Portal } from "@radix-ui/react-portal";
import { MOBILE } from "@/lib/utils/constants";

let currentOpenDropdown = null;

export default function DropdownIcon({
  Icon,
  children,
  className = "",
  iconClassName = "",
  collapsibleContentClassName,
  menuTitle,
  top,
  top2,
  ignoreClick = true,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, right: 0 });
  const router = useRouter();
  const dropdownRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE);
      if (window.innerWidth <= MOBILE) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        // Adjust top position to account for the transparent padding
        top: rect.bottom + window.scrollY - 20,
        right: window.innerWidth - rect.right,
      });
    }

    // Handle click outside for mobile
    if (isOpen && isMobile) {
      const handleClickOutside = (event) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          currentOpenDropdown = null;
        }
      };

      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, isMobile]);

  const handleMouseEvents = (open) => {
    if (!isMobile) {
      setIsOpen(open);
    }
  };

  const handleDropdownChange = (open) => {
    if (ignoreClick && !isMobile) return;

    if (open && isMobile) {
      if (currentOpenDropdown && currentOpenDropdown !== dropdownRef.current) {
        currentOpenDropdown.click();
      }
      currentOpenDropdown = dropdownRef.current;
    } else if (!open && currentOpenDropdown === dropdownRef.current) {
      currentOpenDropdown = null;
    }
    setIsOpen(open);
  };

  const handleLinkClick = (e) => {
    if (isMobile) {
      e.preventDefault();
      const href = e.currentTarget.href;
      setIsOpen(false);
      currentOpenDropdown = null;
      router.push(href);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleDropdownChange}
      className={`relative h24 ${className}`}
    >
      <CollapsibleTrigger
        ref={(el) => {
          dropdownRef.current = el;
          triggerRef.current = el;
        }}
        onMouseEnter={() => handleMouseEvents(true)}
        onMouseLeave={() => handleMouseEvents(false)}
        onClick={(e) => ignoreClick && !isMobile && e.preventDefault()}
        className="relative"
      >
        <Icon className={iconClassName} />
      </CollapsibleTrigger>

      {isOpen && (
        <Portal>
          <CollapsibleContent
            ref={contentRef}
            className={`${collapsibleContentClassName}`}
            onMouseEnter={() => handleMouseEvents(true)}
            onMouseLeave={() => handleMouseEvents(false)}
            style={{
              position: "absolute",
              top: coords.top,
              right: coords.right,
              zIndex: 9999,
              // Expanded area with transparent top padding
              paddingTop: "20px",
            }}
          >
            {/* Actual menu content with background */}
            <div className="bg-background rounded-md shadow-lg py-1">
              <div className="tac !text-sm text-muted-foreground fw500 cursor-default py5 border-b border-border">
                {menuTitle}
              </div>

              {top &&
                React.cloneElement(top, {
                  className:
                    "block px-4 py-2 text-sm text-foreground hover:bg-accent",
                  onClick: handleLinkClick,
                })}

              {children}

              {top2 &&
                React.cloneElement(top2, {
                  className:
                    "block px-4 py-2 text-sm text-foreground hover:bg-accent",
                  onClick: handleLinkClick,
                })}
            </div>
          </CollapsibleContent>
        </Portal>
      )}
    </Collapsible>
  );
}
