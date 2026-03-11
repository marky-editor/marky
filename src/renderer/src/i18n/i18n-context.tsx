import { createContext, useContext, useMemo } from 'react';
import type { Locale } from '@shared/types';
import type { TranslationKeys } from './types';
import { en } from './en';
import { ptBR } from './pt-BR';
import { es } from './es';

const dictionaries: Record<Locale, TranslationKeys> = {
  en,
  'pt-BR': ptBR,
  es,
};

export type TranslateFunction = (
  key: keyof TranslationKeys,
  vars?: Record<string, string | number>,
) => string;

type I18nContextValue = {
  t: TranslateFunction;
  locale: Locale;
};

const I18nContext = createContext<I18nContextValue>({
  t: (key) => en[key],
  locale: 'en',
});

/**
 * Maps an OS locale string (e.g. `pt-BR`, `es-419`, `en-US`) to
 * the closest supported Locale.
 */
export function detectClosestLocale(osLocale: string): Locale {
  const lower = osLocale.toLowerCase().replace(/_/g, '-');

  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';

  return 'en';
}

function translate(
  dict: TranslationKeys,
  key: keyof TranslationKeys,
  vars?: Record<string, string | number>,
): string {
  let value = dict[key] ?? en[key] ?? key;

  if (vars) {
    for (const [varName, varValue] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${varName}\\}`, 'g'), String(varValue));
    }
  }

  return value;
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale] ?? en;
    return {
      t: (key, vars) => translate(dict, key, vars),
      locale,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
