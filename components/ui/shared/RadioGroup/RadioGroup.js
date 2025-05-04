"use client";

import { Label } from "@/components/ui/label";
import {
  RadioGroup as RadixRadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import useInputMemo from "../Input/useInputMemo";

export default function RadioGroup({
  options,
  name,
  value,
  onChange,
  required = false,
  className = "flex flex-wrap gap-4",
  itemClassName = "flex items-center space-x-2",
  radioClassName = "",
  labelClassName = "text-black-500",
}) {
  const normalizedOptions = options.map(option => 
    typeof option === 'string' ? { value: option, label: option } : option
  );

  const { onChange: onMemoChange, defaultValue } = useInputMemo({ 
    name, 
    onChange,
    defaultValue: value?.value || ''
  });

  const handleChange = (selectedValue) => {
    const selectedOption = normalizedOptions.find(opt => opt.value === selectedValue);
    if (selectedOption) {
      // Store just the value in localStorage
      onMemoChange(selectedValue);
      // Pass full object to parent
      onChange?.(selectedOption);
    }
  };

  // Get the stored value from localStorage
  const storedValue = defaultValue();
  const currentValue = storedValue || value?.value || '';

  // Get the full option object for the hidden input
  const selectedOption = normalizedOptions.find(opt => opt.value === currentValue);

  return (
    <RadixRadioGroup
      name={name}
      required={required}
      value={currentValue}
      onValueChange={handleChange}
      className={className}
    >
      {normalizedOptions.map((option) => (
        <div key={option.value} className={itemClassName}>
          <RadioGroupItem
            value={option.value}
            id={option.value}
            className={radioClassName}
          />
          <Label htmlFor={option.value} className={labelClassName}>
            {option.label}
          </Label>
        </div>
      ))}
      <input 
        type="hidden" 
        name={name} 
        value={selectedOption ? JSON.stringify(selectedOption) : ''} 
      />
    </RadixRadioGroup>
  );
}
