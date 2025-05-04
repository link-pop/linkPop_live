"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RegularLabel } from "../Input/FloatingLabelInput";

export default function SelectWithSearch({
  defaultValue = [],
  defaultSelectedValue = "",
  onChange,
  name,
  className,
  popoverContentClassName,
  required = false,
  label,
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultSelectedValue);

  // Ensure defaultValue is always an array
  const options = Array.isArray(defaultValue) ? defaultValue : [];

  const handleSelect = (currentValue) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    setOpen(false);
    if (onChange) {
      onChange?.(newValue);
    }
  };

  return (
    <div className="f wf">
      {label && (
        <RegularLabel className="wf" required={required}>
          {label}
        </RegularLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between py10 pl-[12px] [&:not(:has(span))]:text-muted-foreground"
          >
            {value ? (
              <span>{options.find((item) => item.value === value)?.label}</span>
            ) : (
              `select ${name}...`
            )}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-full p-0 ${popoverContentClassName}`}>
          <Command>
            <CommandInput placeholder={`Search ${name}...`} className="h-9" />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={handleSelect}
                  >
                    {item.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
