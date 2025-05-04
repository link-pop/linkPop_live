"use client";

import React from "react";
import { parseDate } from "chrono-node";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/components/Context/TranslationContext";
import { FloatingLabel } from "@/components/ui/shared/Input/FloatingLabelInput";

export const parseDateTime = (str) => {
  if (str instanceof Date) return str;
  return parseDate(str);
};

export const getDateTimeLocal = (timestamp) => {
  const d = timestamp ? new Date(timestamp) : new Date();
  if (d.toString() === "Invalid Date") return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split(":")
    .slice(0, 2)
    .join(":");
};

// FIXED: Moved this inside a function component where hooks can be used
export const formatDateTime = (datetime, lang) => {
  return new Date(datetime).toLocaleTimeString(lang || "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: lang === "en" ? true : false,
  });
};

const inputBase =
  "bg-transparent focus:outline-none focus:ring-0 focus-within:outline-none focus-within:ring-0 sm:text-sm disabled:cursor-not-allowed disabled:opacity-10";

const naturalInputValidationPattern =
  "^[A-Z][a-z]{2}sd{1,2},sd{4},sd{1,2}:d{2}s[AP]M$";

const DEFAULT_SIZE = 96;

const SmartDatetimeInputContext = React.createContext(null);

const useSmartDateInput = () => {
  const context = React.useContext(SmartDatetimeInputContext);
  if (!context) {
    throw new Error(
      "useSmartDateInput must be used within SmartDateInputProvider"
    );
  }
  return context;
};

export const SmartDatetimeInput = React.forwardRef((props, ref) => {
  const {
    className,
    value,
    defaultValue,
    onValueChange = () => {},
    placeholder,
    disabled,
    name,
    label,
    labelClassName = "",
    minDate,
    maxDate,
    ...rest
  } = props;

  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const initialTime = `${
    currentHour >= 12 ? currentHour % 12 : currentHour
  }:${currentMinutes} ${currentHour >= 12 ? "PM" : "AM"}`;

  const [Time, setTime] = React.useState(initialTime);
  const [isFocused, setIsFocused] = React.useState(false);

  const onTimeChange = React.useCallback((time) => {
    setTime(time);
  }, []);

  const initializeDateTime = (dateValue) => {
    if (!dateValue) return new Date();
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return new Date();
    return date;
  };

  const [internalValue, setInternalValue] = React.useState(
    initializeDateTime(defaultValue || value)
  );

  React.useEffect(() => {
    if (defaultValue) {
      setInternalValue(initializeDateTime(defaultValue));
    }
  }, [defaultValue]);

  const handleValueChange = React.useCallback(
    (newValue) => {
      if (!newValue) return;

      const date = new Date(newValue);
      if (isNaN(date.getTime())) return;

      if (onValueChange) {
        onValueChange(date);
      }
      setInternalValue(date);
    },
    [onValueChange]
  );

  const currentValue = value || internalValue;

  const isSelectedDateEqualDefaultDate = React.useMemo(() => {
    if (!currentValue || (!minDate && !maxDate)) return false;
    const current = new Date(currentValue).getTime();
    return (
      (minDate && current === new Date(minDate).getTime()) ||
      (maxDate && current === new Date(maxDate).getTime())
    );
  }, [currentValue, minDate, maxDate]);

  return (
    <SmartDatetimeInputContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        Time,
        onTimeChange,
        minDate,
        maxDate,
      }}
    >
      <div className="relative">
        {/* Label - using FloatingLabel instead of custom implementation */}
        {label && (
          <FloatingLabel required={false} className={cn(labelClassName)}>
            {label}
          </FloatingLabel>
        )}

        <div className="flex items-center justify-center">
          <input
            type="hidden"
            name={name}
            value={
              currentValue && !isNaN(new Date(currentValue).getTime())
                ? new Date(currentValue).toISOString()
                : new Date().toISOString()
            }
          />
          <div
            className={cn(
              "flex gap-1 w-full p-1 items-center justify-between rounded-md border transition-all",
              "focus-within:outline-0 focus:outline-0 focus:ring-0",
              "placeholder:text-muted-foreground focus-visible:outline-0",
              isFocused && "",
              isSelectedDateEqualDefaultDate && "text-gray-500",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <DateTimeLocalInput />
            <NaturalLanguageInput
              placeholder={placeholder}
              disabled={disabled}
              ref={ref}
            />
          </div>
        </div>
      </div>
    </SmartDatetimeInputContext.Provider>
  );
});

SmartDatetimeInput.displayName = "DatetimeInput";

const TimePicker = () => {
  const { value, onValueChange, Time, onTimeChange, minDate, maxDate } =
    useSmartDateInput();
  const { currentLang } = useTranslation(); // FIXED: Added translation context
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const timestamp = 15;

  // FIXED: Check if we should use 12-hour format based on language
  const use12HourFormat = currentLang === "en" || currentLang === "en-US";

  const isTimeDisabled = React.useCallback(
    (hour, minute) => {
      if (!value || (!minDate && !maxDate)) return false;

      const currentDate = new Date(value);
      currentDate.setHours(hour, minute);

      if (minDate && currentDate < minDate) return true;
      if (maxDate && currentDate > maxDate) return true;

      return false;
    },
    [value, minDate, maxDate]
  );

  const formatTimeDisplay = React.useCallback(
    (hour, minutes) => {
      // FIXED: Format time according to language preference
      if (use12HourFormat) {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const period = hour >= 12 ? "PM" : "AM";
        const formattedMinutes = minutes === 0 ? "00" : minutes;
        return `${formattedHour}:${formattedMinutes} ${period}`;
      } else {
        // 24-hour format
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinutes =
          minutes === 0 ? "00" : minutes.toString().padStart(2, "0");
        return `${formattedHour}:${formattedMinutes}`;
      }
    },
    [use12HourFormat]
  );

  const formateSelectedTime = React.useCallback(
    (time, hour, partStamp) => {
      onTimeChange(time);

      const newVal = parseDateTime(value ?? new Date());

      if (!newVal) return;

      newVal.setHours(
        hour,
        partStamp === 0 ? parseInt("00") : timestamp * partStamp
      );

      onValueChange(newVal);
    },
    [value, onValueChange, onTimeChange]
  );

  const handleKeydown = React.useCallback(
    (e) => {
      e.stopPropagation();

      if (!document) return;

      const moveNext = () => {
        const nextIndex =
          activeIndex + 1 > DEFAULT_SIZE - 1 ? 0 : activeIndex + 1;

        const currentElm = document.getElementById(`time-${nextIndex}`);

        currentElm?.focus();

        setActiveIndex(nextIndex);
      };

      const movePrev = () => {
        const prevIndex =
          activeIndex - 1 < 0 ? DEFAULT_SIZE - 1 : activeIndex - 1;

        const currentElm = document.getElementById(`time-${prevIndex}`);

        currentElm?.focus();

        setActiveIndex(prevIndex);
      };

      const setElement = () => {
        const currentElm = document.getElementById(`time-${activeIndex}`);

        if (!currentElm) return;

        currentElm.focus();

        const timeValue = currentElm.textContent ?? "";

        // FIXED: Handle both 12-hour and 24-hour formats
        if (use12HourFormat) {
          const PM_AM = timeValue.split(" ")[1];
          const PM_AM_hour = parseInt(timeValue.split(" ")[0].split(":")[0]);
          const hour =
            PM_AM === "AM"
              ? PM_AM_hour === 12
                ? 0
                : PM_AM_hour
              : PM_AM_hour === 12
              ? 12
              : PM_AM_hour + 12;

          const part = Math.floor(
            parseInt(timeValue.split(" ")[0].split(":")[1]) / 15
          );

          formateSelectedTime(timeValue, hour, part);
        } else {
          const hour = parseInt(timeValue.split(":")[0]);
          const part = Math.floor(parseInt(timeValue.split(":")[1]) / 15);

          formateSelectedTime(timeValue, hour, part);
        }
      };

      const reset = () => {
        const currentElm = document.getElementById(`time-${activeIndex}`);
        currentElm?.blur();
        setActiveIndex(-1);
      };

      switch (e.key) {
        case "ArrowUp":
          movePrev();
          break;

        case "ArrowDown":
          moveNext();
          break;

        case "Escape":
          reset();
          break;

        case "Enter":
          setElement();
          break;
      }
    },
    [activeIndex, formateSelectedTime, use12HourFormat]
  );

  const handleClick = React.useCallback(
    (hour, part, currentIndex) => {
      const minutes = part === 0 ? 0 : timestamp * part;
      if (isTimeDisabled(hour, minutes)) return;

      const timeString = formatTimeDisplay(hour, minutes);
      formateSelectedTime(timeString, hour, part);
      setActiveIndex(currentIndex);
    },
    [formateSelectedTime, isTimeDisabled, formatTimeDisplay]
  );

  const currentTime = React.useMemo(() => {
    if (use12HourFormat) {
      const timeVal = Time.split(" ")[0];
      return {
        hours: parseInt(timeVal.split(":")[0]),
        minutes: parseInt(timeVal.split(":")[1]),
        period: Time.split(" ")[1],
      };
    } else {
      return {
        hours: parseInt(Time.split(":")[0]),
        minutes: parseInt(Time.split(":")[1]),
      };
    }
  }, [Time, use12HourFormat]);

  React.useEffect(() => {
    const getCurrentElementTime = () => {
      if (use12HourFormat) {
        const timeVal = Time.split(" ")[0];
        const hours = parseInt(timeVal.split(":")[0]);
        const minutes = parseInt(timeVal.split(":")[1]);
        const PM_AM = Time.split(" ")[1];

        const formatIndex =
          PM_AM === "AM" ? hours : hours === 12 ? hours : hours + 12;
        const formattedHours = formatIndex;

        for (let j = 0; j <= 3; j++) {
          const diff = Math.abs(j * timestamp - minutes);
          const selected =
            PM_AM === (formattedHours >= 12 ? "PM" : "AM") &&
            (minutes <= 53
              ? diff < Math.ceil(timestamp / 2)
              : diff < timestamp);

          if (selected) {
            const trueIndex =
              activeIndex === -1 ? formattedHours * 4 + j : activeIndex;

            setActiveIndex(trueIndex);

            const currentElm = document.getElementById(`time-${trueIndex}`);
            currentElm?.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
          }
        }
      } else {
        // 24-hour format handling
        const hours = parseInt(Time.split(":")[0]);
        const minutes = parseInt(Time.split(":")[1]);

        for (let j = 0; j <= 3; j++) {
          const diff = Math.abs(j * timestamp - minutes);
          const selected =
            minutes <= 53 ? diff < Math.ceil(timestamp / 2) : diff < timestamp;

          if (selected) {
            const trueIndex = activeIndex === -1 ? hours * 4 + j : activeIndex;

            setActiveIndex(trueIndex);

            const currentElm = document.getElementById(`time-${trueIndex}`);
            currentElm?.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
          }
        }
      }
    };

    getCurrentElementTime();
  }, [Time, activeIndex, use12HourFormat]);

  const height = React.useMemo(() => {
    if (!document) return;
    const calendarElm = document.getElementById("calendar");
    if (!calendarElm) return;
    return calendarElm.style.height;
  }, []);

  const { t } = useTranslation();

  return (
    <div className="space-y-2 pr-3 py-3 relative ">
      <h3 className="text-sm font-medium tac ">{t("time")}</h3>
      <ScrollArea
        onKeyDown={handleKeydown}
        className="h-[90%] w-full focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 py-0.5"
        style={{
          height,
        }}
      >
        <ul
          className={cn(
            "flex items-center flex-col gap-1 h-full max-h-56 w-28 px-1 py-0.5"
          )}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            // FIXED: Format time display based on language preference
            return Array.from({ length: 4 }).map((_, part) => {
              const minutes = part === 0 ? 0 : timestamp * part;
              const timeDisplay = formatTimeDisplay(i, minutes);

              let isSelected = false;

              if (use12HourFormat) {
                const PM_AM = i >= 12 ? "PM" : "AM";
                const formatIndex =
                  i > 12 ? i % 12 : i === 0 || i === 12 ? 12 : i;
                const diff = Math.abs(part * timestamp - currentTime.minutes);

                isSelected =
                  currentTime.hours === formatIndex &&
                  currentTime.period === PM_AM &&
                  (currentTime.minutes <= 53
                    ? diff < Math.ceil(timestamp / 2)
                    : diff < timestamp);
              } else {
                const diff = Math.abs(part * timestamp - currentTime.minutes);

                isSelected =
                  currentTime.hours === i &&
                  (currentTime.minutes <= 53
                    ? diff < Math.ceil(timestamp / 2)
                    : diff < timestamp);
              }

              const trueIndex = i * 4 + part;
              const isSuggested = !value && isSelected;

              return (
                <li
                  tabIndex={isSelected ? 0 : -1}
                  id={`time-${trueIndex}`}
                  key={`time-${trueIndex}`}
                  aria-label="currentTime"
                  className={cn(
                    buttonVariants({
                      variant: isSuggested
                        ? "secondary"
                        : isSelected
                        ? "default"
                        : "outline",
                    }),
                    "h-8 px-3 w-full text-sm focus-visible:outline-0 outline-0 focus-visible:border-0 cursor-default ring-0",
                    isTimeDisabled(i, minutes) &&
                      "opacity-10 pointer-events-none"
                  )}
                  onClick={() => handleClick(i, part, trueIndex)}
                  onFocus={() => isSuggested && setActiveIndex(trueIndex)}
                  disabled={isTimeDisabled(i, minutes)}
                >
                  {timeDisplay}
                </li>
              );
            });
          })}
        </ul>
      </ScrollArea>
    </div>
  );
};

const NaturalLanguageInput = React.forwardRef((props, ref) => {
  const { placeholder, ...rest } = props;

  const { value, onValueChange, Time, onTimeChange } = useSmartDateInput();
  const { currentLang } = useTranslation(); // FIXED: Now using hook inside a component

  const _placeholder = placeholder ?? 'e.g. "tomorrow at 5pm" or "in 2 hours"';

  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    const hour = new Date().getHours();
    const timeVal = `${
      hour >= 12 ? hour % 12 : hour
    }:${new Date().getMinutes()} ${hour >= 12 ? "PM" : "AM"}`;
    setInputValue(value ? formatDateTime(value, currentLang) : "");
    onTimeChange(value ? Time : timeVal);
  }, [value, Time, currentLang]);

  const handleParse = React.useCallback(
    (e) => {
      const parsedDateTime = parseDateTime(e.currentTarget.value);
      if (parsedDateTime) {
        const PM_AM = parsedDateTime.getHours() >= 12 ? "PM" : "AM";
        const PM_AM_hour = parsedDateTime.getHours();

        const hour =
          PM_AM_hour > 12
            ? PM_AM_hour % 12
            : PM_AM_hour === 0 || PM_AM_hour === 12
            ? 12
            : PM_AM_hour;

        onValueChange(parsedDateTime);
        setInputValue(formatDateTime(parsedDateTime, currentLang));
        onTimeChange(`${hour}:${parsedDateTime.getMinutes()} ${PM_AM}`);
      }
    },
    [value, currentLang]
  );

  const handleKeydown = React.useCallback(
    (e) => {
      switch (e.key) {
        case "Enter":
          const parsedDateTime = parseDateTime(e.currentTarget.value);
          if (parsedDateTime) {
            const PM_AM = parsedDateTime.getHours() >= 12 ? "PM" : "AM";
            const PM_AM_hour = parsedDateTime.getHours();

            const hour =
              PM_AM_hour > 12
                ? PM_AM_hour % 12
                : PM_AM_hour === 0 || PM_AM_hour === 12
                ? 12
                : PM_AM_hour;

            onValueChange(parsedDateTime);
            setInputValue(formatDateTime(parsedDateTime, currentLang));
            onTimeChange(`${hour}:${parsedDateTime.getMinutes()} ${PM_AM}`);
          }
          break;
      }
    },
    [value, currentLang]
  );

  return (
    <Input
      ref={ref}
      type="text"
      placeholder={_placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.currentTarget.value)}
      onKeyDown={handleKeydown}
      onBlur={handleParse}
      className={cn("px-2 mr-0.5 flex-1 border-none h-8 rounded", inputBase)}
      {...props}
    />
  );
});

NaturalLanguageInput.displayName = "NaturalLanguageInput";

const DateTimeLocalInput = ({ className, ...props }) => {
  const { value, onValueChange, Time, minDate, maxDate } = useSmartDateInput();

  const formateSelectedDate = React.useCallback(
    (date, selectedDate, m, e) => {
      const parsedDateTime = parseDateTime(selectedDate);

      if (parsedDateTime) {
        parsedDateTime.setHours(
          parseInt(Time.split(":")[0]),
          parseInt(Time.split(":")[1])
        );
        onValueChange(parsedDateTime);
      }
    },
    [value, Time]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size={"icon"}
          className={cn(
            "size-9 flex items-center justify-center font-normal bg-transparent hover:bg-transparent",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="size-4" />
          <span className="sr-only">calender</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" sideOffset={8}>
        <div className="flex gap-1">
          <Calendar
            {...props}
            id={"calendar"}
            className={cn("peer flex justify-end", inputBase, className)}
            mode="single"
            selected={value}
            onSelect={formateSelectedDate}
            initialFocus
            fromDate={minDate}
            toDate={maxDate}
            disabled={(date) =>
              (minDate && date < minDate) || (maxDate && date > maxDate)
            }
          />
          <TimePicker />
        </div>
      </PopoverContent>
    </Popover>
  );
};

DateTimeLocalInput.displayName = "DateTimeLocalInput";
