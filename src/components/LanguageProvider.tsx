import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LANG_STORAGE_KEY,
  LanguageContext,
  translations,
  type Lang,
} from "@/lib/i18n";

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "hi") return stored;
  } catch {
    // localStorage unavailable (private mode, blocked cookies) — fall through.
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore — the choice simply won't persist.
    }
  }, [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t: translations[lang] }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
