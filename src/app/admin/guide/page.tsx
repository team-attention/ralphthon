'use client'

import { useTranslations } from 'next-intl'
import { Guide } from '@/components/guide'

export default function AdminGuidePage() {
  const t = useTranslations('guide')

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">
          Ralphthon
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
        <Guide />
      </div>
    </div>
  )
}
