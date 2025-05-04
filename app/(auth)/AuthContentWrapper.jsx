"use client";

import { TranslationProvider } from "@/components/Context/TranslationContext";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { languages } from "@/data/locales";

// Dynamic import of the AuthContent component to avoid hydration issues
const AuthContent = dynamic(() => import("@/app/(auth)/AuthContent"), {
  ssr: false,
  loading: () => (
    <>
      <p className={`fz38 tac por z-10 white tracking-[1.5]`}>Sign in</p>
      <Loader2 className="animate-spin w-6 h-6 text-gray-200 mx-auto my-2" />
      <p className={`fz15 tal por l5 z-10 white`}>Please wait</p>
    </>
  ),
});

// ! code start AuthContentWrapper
const AuthContentWrapper = () => {
  const [initialLang, setInitialLang] = useState("en");
  
  useEffect(() => {
    // First try to get the user's selected language from localStorage
    const savedLang = localStorage.getItem("selectedLanguage");
    
    if (savedLang && languages[savedLang]) {
      setInitialLang(savedLang);
      return;
    }
    
    // If no saved language, try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    
    // Check if we support this language
    if (languages[browserLang]) {
      setInitialLang(browserLang);
    }
    // Otherwise keep default "en"
  }, []);

  return (
    <TranslationProvider initialLang={initialLang}>
      <AuthContent />
    </TranslationProvider>
  );
};

export default AuthContentWrapper;
// ? code end AuthContentWrapper 