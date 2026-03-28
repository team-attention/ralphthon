'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
] as const

export function LocaleSwitcher() {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [currentLocale, setCurrentLocale] = useState('ko')

  useEffect(() => {
    const cookie = document.cookie.split('; ').find((c) => c.startsWith('NEXT_LOCALE='))
    if (cookie) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentLocale(cookie.split('=')[1])
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentLocale(document.documentElement.lang || 'ko')
    }
  }, [])

  function handleChange(locale: string) {
    setCurrentLocale(locale)
    startTransition(async () => {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      router.refresh()
    })
  }

  return (
    <div className="flex gap-1">
      {LOCALES.map((l) => (
        <Button
          key={l.code}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          style={{
            color: currentLocale === l.code ? '#FFD90F' : '#8892b0',
            borderBottom: currentLocale === l.code ? '2px solid #FFD90F' : '2px solid transparent',
            borderRadius: 0,
          }}
          onClick={() => handleChange(l.code)}
        >
          {l.label}
        </Button>
      ))}
    </div>
  )
}
