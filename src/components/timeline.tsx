'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type City = 'Busan'

// ── Busan Timeline ───────────────────────────────

type BusanEntry = {
  time: string
  activityKey: string
  highlight?: boolean
  lobster?: boolean
}

const BUSAN_ENTRIES: BusanEntry[] = [
  { time: '13:00', activityKey: 'busan_t1300' },
  { time: '13:40', activityKey: 'busan_t1340' },
  { time: '14:15-16:45', activityKey: 'busan_t1415', lobster: true, highlight: true },
  { time: '17:00', activityKey: 'busan_t1700' },
  { time: '17:45', activityKey: 'busan_t1745' },
  { time: '18:20-18:50', activityKey: 'busan_t1820' },
]

// ── Components ───────────────────────────────────

export function EventInfo() {
  const t = useTranslations('timeline')

  const infoRows = [
    { label: t('event'), value: `${t('busan_name')} (${t('subtitle')})` },
    { label: t('dateLabel'), value: t('busan_date') },
    { label: t('venueLabel'), value: t('busan_venue') },
    { label: t('scaleLabel'), value: t('scale') },
    { label: t('lumaLabel'), value: t('busan_luma'), isLink: true, href: 'https://luma.com/luuilxvp' },
    { label: t('crossCityLabel'), value: t('crossCity') },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('eventInfo')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {infoRows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <span
                className="min-w-[90px] shrink-0 text-xs font-medium uppercase tracking-wide"
                style={{ color: '#8892b0' }}
              >
                {row.label}
              </span>
              {row.isLink ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline underline-offset-2 hover:text-foreground"
                  style={{ color: '#64ffda' }}
                >
                  {row.value}
                </a>
              ) : (
                <span className="text-sm font-medium">{row.value}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function BusanSchedule() {
  const t = useTranslations('timeline')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('schedule')}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div
          className="grid grid-cols-[120px_1fr] items-center gap-2 border-b px-4 pb-2 text-xs font-medium uppercase tracking-wide"
          style={{ color: '#8892b0' }}
        >
          <span>{t('seoulTime')}</span>
          <span>{t('activity')}</span>
        </div>
        <div className="flex flex-col">
          {BUSAN_ENTRIES.map((entry) => (
            <div
              key={entry.activityKey}
              className="grid grid-cols-[120px_1fr] items-center gap-2 border-b px-4 py-3 text-sm last:border-b-0"
              style={
                entry.highlight
                  ? { background: 'rgba(255, 217, 15, 0.06)', borderLeft: '3px solid #FFD90F' }
                  : undefined
              }
            >
              <span className="font-mono text-xs font-bold" style={{ color: entry.highlight ? '#FFD90F' : undefined }}>
                {entry.time}
              </span>
              <span className="flex items-center gap-1.5">
                {entry.lobster && <span>{'\u{1F99E}'}</span>}
                {entry.highlight ? (
                  <span className="font-bold">{t(entry.activityKey)}</span>
                ) : (
                  t(entry.activityKey)
                )}
                {entry.highlight && (
                  <Badge variant="outline" className="ml-1 text-[10px]">
                    DEADLINE
                  </Badge>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TimelineSchedule() {
  return <BusanSchedule />
}

function CityTabs({ city, onChange }: { city: City; onChange: (c: City) => void }) {
  return (
    <div className="flex gap-2">
      <Button
        variant={city === 'Busan' ? 'default' : 'outline'}
        onClick={() => onChange('Busan')}
        size="sm"
      >
        Busan
      </Button>
    </div>
  )
}

export function Timeline() {
  const [city, setCity] = useState<City>('Busan')

  return (
    <div className="flex flex-col gap-6">
      <CityTabs city={city} onChange={setCity} />
      <EventInfo />
      <TimelineSchedule />
    </div>
  )
}
