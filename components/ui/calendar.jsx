"use client";
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import {
  enUS,
  zhCN,
  hi,
  es,
  fr,
  ar,
  bn,
  pt,
  ru,
  ur,
  ja,
  de,
  tr,
  fa,
  sw,
  it,
  ko,
  vi,
  zhHK, // for Cantonese (yue)
  th,
  uk,
} from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useTranslation } from "@/components/Context/TranslationContext";

// Map of language codes to date-fns locale objects
const localeMap = {
  // Main locale mapping with region-specific codes
  "en-US": enUS,
  "zh-CN": zhCN,
  "hi-IN": hi,
  "es-ES": es,
  "fr-FR": fr,
  "ar-SA": ar,
  "bn-BD": bn,
  "pt-BR": pt,
  "ru-RU": ru,
  "ur-PK": ur,
  "ja-JP": ja,
  "de-DE": de,
  "tr-TR": tr,
  "fa-IR": fa,
  "sw-KE": sw,
  "it-IT": it,
  "ko-KR": ko,
  "vi-VN": vi,
  "yue-HK": zhHK, // Using Hong Kong Chinese for Cantonese
  "th-TH": th,
  "uk-UA": uk,

  // Simple language code mapping (without region)
  en: enUS,
  zh: zhCN,
  hi: hi,
  es: es,
  fr: fr,
  ar: ar,
  bn: bn,
  pt: pt,
  ru: ru,
  ur: ur,
  ja: ja,
  de: de,
  tr: tr,
  fa: fa,
  sw: sw,
  it: it,
  ko: ko,
  vi: vi,
  yue: zhHK, // Using Hong Kong Chinese for Cantonese
  th: th,
  uk: uk,
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = "en", // Default locale
  ...props
}) {
  const { currentLang } = useTranslation();
  locale = currentLang || locale;

  // Use the correct date-fns locale object based on the requested locale string
  const selectedLocale = localeMap[locale] || enUS;

  // Function to format dates according to the selected locale
  const formatCaption = (date, options) => {
    return format(date, "LLLL yyyy", { locale: selectedLocale });
  };

  // Custom weekday formatter to ensure proper display in all languages
  const formatWeekdayName = (weekday, options) => {
    return format(weekday, "EEEEEE", { locale: selectedLocale });
  };

  return (
    <DayPicker
      locale={selectedLocale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
      }}
      formatters={{
        formatCaption,
        formatWeekday: formatWeekdayName,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
