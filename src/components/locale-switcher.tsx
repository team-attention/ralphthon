'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
] as const

export function LocaleSwitcher() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function handleChange(locale: string) {
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
          onClick={() => handleChange(l.code)}
        >
          {l.label}
        </Button>
      ))}
    </div>
  )
}
