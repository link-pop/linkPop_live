import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FloatingInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Input
      placeholder=" "
      className={cn("peer", className)}
      ref={ref}
      {...props}
    />
  );
});
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef(
  ({ className, required, ...props }, ref) => {
    return (
      <Label
        // to change position search "5px" - 2 items
        // w-[95%] to cover underlying placeholder
        // "pen" class to let go click through the floating label
        className={cn(
          "peer-focus:secondary peer-focus:dark:secondary absolute start-2 origin-[0] -translate-y-4 scale-75 transform bg-background px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-background rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 cursor-text",
          "top-[5px] peer-focus:top-[5px]",
          "pen peer-placeholder-shown:w-[95%] peer-focus:!wfc",
          "ttu",
          "!wsn",
          className
        )}
        ref={ref}
        {...props}
      >
        {required && "* "}
        {props.children}
      </Label>
    );
  }
);
FloatingLabel.displayName = "FloatingLabel";

const RegularLabel = React.forwardRef(
  ({ className, required, ...props }, ref) => {
    return (
      <Label
        className={cn(
          "fz12 fw600 uppercase mb-2 block font-medium text-black-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {required && "* "}
        {props.children}
      </Label>
    );
  }
);
RegularLabel.displayName = "RegularLabel";

const FloatingLabelInput = React.forwardRef(
  ({ id, label, floating = false, className, required, ...props }, ref) => {
    if (floating) {
      return (
        <div className={`relative`}>
          <FloatingInput
            ref={ref}
            id={id}
            required={required}
            {...props}
            className={className}
          />
          <FloatingLabel htmlFor={id} required={required}>
            {label}
          </FloatingLabel>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <RegularLabel htmlFor={id} required={required}>
          {label}
        </RegularLabel>
        <Input
          ref={ref}
          id={id}
          className={className}
          required={required}
          {...props}
        />
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingInput, FloatingLabel, RegularLabel, FloatingLabelInput };
