import { NextRequest, NextResponse } from 'next/server'
import { LOCALES, type Locale } from '@/i18n/locale'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { locale } = body as { locale: string }

  if (!locale || !LOCALES.includes(locale as Locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000,
  })
  return response
}
