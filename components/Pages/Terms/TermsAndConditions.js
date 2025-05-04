"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import Link from "next/link";
import EnglishTerms from "./EnglishTerms";
import UkrainianTerms from "./UkrainianTerms";
import SpanishTerms from "./SpanishTerms";
import HindiTerms from "./HindiTerms";
import FrenchTerms from "./FrenchTerms";
import ChineseTerms from "./ChineseTerms";
import { ArrowLeft } from "lucide-react";

// ! code start TermsAndConditions
export default function TermsAndConditions() {
  const { t, currentLang } = useTranslation();

  const renderTermsByLanguage = () => {
    switch (currentLang) {
      case "uk":
        return <UkrainianTerms />;
      case "es":
        return <SpanishTerms />;
      case "hi":
        return <HindiTerms />;
      case "fr":
        return <FrenchTerms />;
      case "zh":
        return <ChineseTerms />;
      default:
        return <EnglishTerms />;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mt-8">
        <Link
          href="/"
          className="f aic g5 mb50 underline text-primary hover:underline"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t("backToHome")}
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">{t("termsAndConditions")}</h1>

      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg shadow">
          {renderTermsByLanguage()}
        </div>
      </div>
    </div>
  );
}
// ? code end TermsAndConditions
