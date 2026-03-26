'use client'

import { useTranslations } from 'next-intl'
import { Timeline } from '@/components/timeline'

export default function TimelinePage() {
  const t = useTranslations('timeline')

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <h1
          className="mb-2 font-display text-4xl tracking-wider"
          style={{ color: '#FFD90F' }}
        >
          {t('title')}
        </h1>
        <p className="mb-8 text-lg" style={{ color: '#8892b0' }}>
          {t('subtitle')}
        </p>
        <Timeline />
      </div>
    </div>
  )
}
