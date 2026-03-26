import { cookies } from 'next/headers'

const COOKIE_NAME = 'NEXT_LOCALE'
const DEFAULT_LOCALE = 'en'
export const LOCALES = ['en', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get(COOKIE_NAME)?.value
  if (locale && LOCALES.includes(locale as Locale)) {
    return locale as Locale
  }
  return DEFAULT_LOCALE
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, locale)
}
