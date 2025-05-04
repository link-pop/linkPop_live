"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export const AlertDialogOverlay = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
      ref={ref}
    />
  )
);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export const AlertDialogContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    const [lifted, setLifted] = React.useState(false);
    const contentRef = React.useRef(null);
    // Combine forwarded ref and local ref
    React.useImperativeHandle(ref, () => contentRef.current);

    // ! code start virtual keyboard detection
    React.useEffect(() => {
      if (typeof window === "undefined") return;
      
      let initialHeight = window.innerHeight;
      let timeout;
      
      // Function to check if keyboard is open
      const checkKeyboardOpen = () => {
        // Use visual viewport if available (more accurate)
        if (window.visualViewport) {
          const keyboardOpen = window.innerHeight - window.visualViewport.height > 100;
          setLifted(keyboardOpen);
        } else {
          // Fallback to the old method
          const keyboardOpen = window.innerHeight < initialHeight - 150;
          setLifted(keyboardOpen);
        }
      };

      // Handle resize events (keyboard opening/closing)
      const handleResize = () => {
        checkKeyboardOpen();
      };
      
      // Handle focus events on inputs/textareas within the dialog
      const handleFocusIn = (e) => {
        if (
          contentRef.current &&
          contentRef.current.contains(e.target) &&
          (e.target.tagName === "INPUT" || 
           e.target.tagName === "TEXTAREA" ||
           e.target.isContentEditable)
        ) {
          // Small delay to let keyboard open
          setTimeout(checkKeyboardOpen, 100);
          setTimeout(checkKeyboardOpen, 300);
          setTimeout(checkKeyboardOpen, 500);
        }
      };
      
      // Set up event listeners
      window.addEventListener("resize", handleResize);
      document.addEventListener("focusin", handleFocusIn);
      
      // Setup visual viewport listeners if available
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleResize);
      }
      
      return () => {
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("focusin", handleFocusIn);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", handleResize);
        }
        clearTimeout(timeout);
      };
    }, []);
    // ? code end virtual keyboard detection

    return (
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
          ref={contentRef}
          className={cn(
            "fixed left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] gap-4 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            lifted
              ? "top-[20%] translate-y-0" 
              : "top-[50%] translate-y-[-50%]",
            className
          )}
          {...props}
        />
      </AlertDialogPortal>
    );
  }
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2",
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

export const AlertDialogTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

export const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

export const AlertDialogAction = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "text-black hover:bg-gray-800 hover:text-white",
        className
      )}
      {...props}
    />
  )
);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export const AlertDialogCancel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0 text-black hover:bg-gray-800 hover:text-white",
        className
      )}
      {...props}
    />
  )
);
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
