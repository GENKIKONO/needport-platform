export const locales = ['ja', 'en'] as const;
export const defaultLocale = 'ja' as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English'
};
