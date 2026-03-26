'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type TimelineEntry = {
  sfTime: string
  seoulTime?: string
  activityKey: string
  highlight?: boolean
  lobster?: boolean
}

const TIMELINE_ENTRIES: TimelineEntry[] = [
  { sfTime: '09:00 AM', activityKey: 't0900' },
  { sfTime: '10:00 AM', activityKey: 't1000' },
  { sfTime: '10:30 AM', activityKey: 't1030' },
  { sfTime: '01:00 PM', activityKey: 't1300', lobster: true },
  { sfTime: '01:00–04:00 PM', activityKey: 't1300_1600' },
  { sfTime: '04:00 PM', activityKey: 't1600' },
  { sfTime: '05:00 PM', activityKey: 't1700' },
  { sfTime: '05:30 PM', seoulTime: '09:30 AM', activityKey: 't1730', highlight: true },
  { sfTime: '06:30 PM', activityKey: 't1830' },
  { sfTime: '07:30 PM', activityKey: 't1930' },
  { sfTime: '~08:00 PM', activityKey: 't2000' },
]

export function EventInfo() {
  const t = useTranslations('timeline')

  const infoRows = [
    { label: t('event'), value: `${t('title')} (${t('subtitle')})` },
    { label: t('dateLabel'), value: t('date') },
    { label: t('venueLabel'), value: t('venue') },
    { label: t('scaleLabel'), value: t('scale') },
    { label: t('lumaLabel'), value: t('luma'), isLink: true, href: 'https://luma.com/kxoq82yq' },
    { label: t('crossCityLabel'), value: t('crossCity') },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {t('eventInfo')}
        </CardTitle>
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

export function TimelineSchedule() {
  const t = useTranslations('timeline')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('schedule')}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {/* Header */}
        <div
          className="grid grid-cols-[100px_80px_1fr] items-center gap-2 border-b px-4 pb-2 text-xs font-medium uppercase tracking-wide sm:grid-cols-[120px_100px_1fr]"
          style={{ color: '#8892b0' }}
        >
          <span>{t('sfTime')}</span>
          <span>{t('seoulTime')}</span>
          <span>{t('activity')}</span>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {TIMELINE_ENTRIES.map((entry) => (
            <div
              key={entry.activityKey}
              className="grid grid-cols-[100px_80px_1fr] items-center gap-2 border-b px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[120px_100px_1fr]"
              style={
                entry.highlight
                  ? {
                      background: 'rgba(255, 217, 15, 0.06)',
                      borderLeft: '3px solid #FFD90F',
                    }
                  : undefined
              }
            >
              <span className="font-mono text-xs font-bold" style={{ color: entry.highlight ? '#FFD90F' : undefined }}>
                {entry.sfTime}
              </span>
              <span className="font-mono text-xs" style={{ color: '#8892b0' }}>
                {entry.seoulTime || ''}
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
                    CROSS-CITY
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

export function Timeline() {
  return (
    <div className="flex flex-col gap-6">
      <EventInfo />
      <TimelineSchedule />
    </div>
  )
}
