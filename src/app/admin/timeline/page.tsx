'use client'

import { useTranslations } from 'next-intl'
import { Timeline } from '@/components/timeline'

export default function AdminTimelinePage() {
  const t = useTranslations('timeline')

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">
          Ralphthon
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
        <Timeline />
      </div>
    </div>
  )
}
