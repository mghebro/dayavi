"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, Dictionary } from "./types";
import { en } from "./dictionaries/en";
import { ka } from "./dictionaries/ka";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ka,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "dayavi_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ka"); // Default to Georgian for Dayavi experience

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "en" || stored === "ka") {
        setLocaleState(stored);
      } else {
        // Also check document cookie
        const match = document.cookie.match(new RegExp("(^| )dayavi_locale=([^;]+)"));
        if (match && (match[2] === "en" || match[2] === "ka")) {
          setLocaleState(match[2] as Locale);
        }
      }
    } catch {
      // Storage access disabled or SSR fallback
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `dayavi_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
  };

  const t = dictionaries[locale] || ka;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback to Georgian dictionary if rendered outside provider
    return {
      locale: "ka" as Locale,
      setLocale: () => {},
      t: ka,
    };
  }
  return context;
}
