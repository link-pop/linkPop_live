"use client";

import * as React from "react";
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
import { Plus, X } from "lucide-react";

export default function SelectMulti({
  selectedValues = [],
  availableOptions = [],
  name,
  required = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedItems, setSelectedItems] =
    React.useState(selectedValues);
  const [availableItems, setAvailableItems] = React.useState(
    availableOptions
  );
  const inputRef = React.useRef(null);

  const addItem = (item) => {
    setSelectedItems((prev) => [...prev, item]);
    setAvailableItems((prev) =>
      prev.filter((s) => s.value !== item.value)
    );
    // Clear search input
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.value = "";
      }, 1);
    }
  };

  const handleSelect = (value) => {
    const selectedItem = availableItems.find(
      (item) => item.value === value
    );
    if (selectedItem) {
      addItem(selectedItem);
    }
    // setOpen(false);
  };

  const handleRemove = (value) => {
    const removedItem = selectedItems.find(
      (item) => item.value === value
    );
    if (removedItem) {
      setAvailableItems((prev) => [...prev, removedItem]);
      setSelectedItems((prev) =>
        prev.filter((item) => item.value !== value)
      );
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputRef.current) {
      addInputValueToSelected();
    }
  };

  const addInputValueToSelected = () => {
    const inputValue = inputRef.current.value.trim();
    const isAvailable = availableItems.find((item) =>
      item.value?.toLowerCase().includes(inputValue.toLowerCase())
    );
    const isSelected = selectedItems.find(
      (item) => item.value?.toLowerCase() === inputValue.toLowerCase()
    );

    if (!isAvailable && !isSelected && inputValue) {
      const newItem = { value: inputValue, label: inputValue };
      addItem(newItem);
      inputRef.current.value = ""; // Clear the input
      // setOpen(false);
    }
  };

  const clearAllSelected = () => {
    setAvailableItems((prev) => [...prev, ...selectedItems]);
    setSelectedItems([]);
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="f fwn">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start"
              title="Add"
              style={{
                display: "flex",
                flexWrap: "wrap",
                height: "auto",
                minHeight: "40px",
                padding: "10px",
                minWidth: "150px",
                width: "auto",
                maxWidth: "100vw",
                whiteSpace: "normal",
                overflowWrap: "break-word",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedItems.length > 0
                ? selectedItems.map((item) => (
                    <span
                      key={item.value}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the popover
                        handleRemove(item.value);
                      }}
                      title="Remove"
                      style={{
                        cursor: "pointer",
                        marginRight: "5px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                        padding: "2px 5px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {item.label}
                      <X
                        className="ml-1 h-4 w-4 text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the popover
                          handleRemove(item.value);
                        }}
                      />
                    </span>
                  ))
                : ``}
              <div className="fcc g3">
                <Plus
                  className="h-5 w-5 text-black-600 cursor-pointer"
                  title="Add new"
                />
                <span>{name}</span>
              </div>
            </Button>
          </PopoverTrigger>
          {selectedItems.length > 0 && (
            <X
              className="ml5 mt15 mih20 miw20 h20 w20 text-black-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                clearAllSelected();
              }}
              title="Clear all"
            />
          )}
        </div>
        <PopoverContent className="miw200 p-0" align="center">
          <Command>
            <CommandInput
              placeholder={`Filter or add ${name}...`}
              ref={inputRef}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                <div className="mb10">No results found.</div>
                <Button onClick={addInputValueToSelected}>add</Button>
              </CommandEmpty>
              <CommandGroup>
                {availableItems.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={handleSelect}
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input
        required={required}
        className="sr-only cx" // hidden required input
        tabIndex={-1} // !!!
        name={name}
        value={
          JSON.stringify(selectedItems) === "[]"
            ? ""
            : JSON.stringify(selectedItems)
        }
      />
    </div>
  );
}
