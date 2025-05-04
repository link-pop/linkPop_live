"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useState } from "react";

export default function Toggle({
  labels = [
    { text: "label1", className: "" },
    { text: "label2", className: "" },
  ],
  contents = [null, null],
  className = "",
  labelsClassName = "",
  style,
}) {
  const [switched, setSwitched] = useState(0);
  const { t } = useTranslation();

  return (
    <div className={`fc ${className}`} style={style}>
      <div className={`wf ${labelsClassName}`}>
        <div className="f max-[768px]:!fc wf">
          {labels.map((label, index) => (
            <div
              key={index}
              onClick={() => setSwitched(index)}
              className={`${
                switched === index
                  ? "border-b-2 border-[var(--color-brand)] brand font-medium"
                  : "border-b-2 border-transparent text-foreground hover:bg-accent"
              } ${
                label.className
              } cp py-2 px-4 text-center transition-colors duration-200 flex-1`}
            >
              {t(label.text.toLowerCase().replace(" ", ""))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">{contents[switched]}</div>
    </div>
  );
}
