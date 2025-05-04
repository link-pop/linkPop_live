"use client";

import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start FormSection
const FormSection = ({
  title,
  children,
  className = "",
  showBorder = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`my-4 ${className}`}>
      {title && <div className="tac fz20 mt25 mb-4">{t(title) || title}</div>}
      {children}
      {showBorder && <hr className="my-4 border-gray-200 border-dashed" />}
    </div>
  );
};
// ? code end FormSection

export default FormSection;
