import { useTranslations } from 'next-intl';

export function useT() {
  return useTranslations();
}

// Helper function for nested translations
export function useTN(namespace: string) {
  return useTranslations(namespace);
}
