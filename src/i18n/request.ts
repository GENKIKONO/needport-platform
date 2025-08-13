import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function getLocale(): string {
  // For now, always return 'ja' as the default locale
  return 'ja';
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!['ja', 'en'].includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
