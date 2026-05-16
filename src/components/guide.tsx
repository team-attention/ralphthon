'use client'

import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function TrackBlock({
  title,
  tagline,
  desc,
  bullets,
  closing,
  think,
}: {
  title: string
  tagline: string
  desc: string
  bullets: string[]
  closing: string
  think: string
}) {
  return (
    <div>
      <h3 className="mb-1 text-base font-bold">{title}</h3>
      <p className="mb-2 text-sm font-medium" style={{ color: '#FFD90F' }}>{tagline}</p>
      <p className="mb-3 text-sm" style={{ color: '#8892b0' }}>{desc}</p>
      <ul className="mb-3 ml-4 flex flex-col gap-1.5">
        {bullets.map((b) => (
          <li key={b} className="text-sm" style={{ color: '#8892b0' }}>• {b}</li>
        ))}
      </ul>
      <p className="mb-3 text-sm" style={{ color: '#8892b0' }}>{closing}</p>
      <p className="text-sm italic" style={{ color: '#64ffda' }}>{think}</p>
    </div>
  )
}

function TrackTable({ rows }: { rows: string[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-[160px_1fr_1fr] border-b text-sm font-bold">
        <div className="px-3 py-2"></div>
        <div className="px-3 py-2" style={{ color: '#FFD90F' }}>Impact</div>
        <div className="px-3 py-2" style={{ color: '#64ffda' }}>Harness</div>
      </div>
      {rows.map((row) => {
        const parts = row.split('|')
        return (
          <div
            key={parts[0]}
            className="grid min-w-[640px] grid-cols-[160px_1fr_1fr] border-b text-sm last:border-b-0"
          >
            <div className="px-3 py-3 font-medium">{parts[0]}</div>
            <div className="px-3 py-3" style={{ color: '#8892b0' }}>{parts[1]}</div>
            <div className="px-3 py-3" style={{ color: '#8892b0' }}>{parts[2]}</div>
          </div>
        )
      })}
    </div>
  )
}

export function Guide() {
  const t = useTranslations('guide')

  const track1Bullets = [t('track1Bullet1'), t('track1Bullet2'), t('track1Bullet3'), t('track1Bullet4')]
  const track2Bullets = [t('track2Bullet1'), t('track2Bullet2'), t('track2Bullet3'), t('track2Bullet4')]
  const trackTableRows = [
    t('trackTableRow1'),
    t('trackTableRow2'),
    t('trackTableRow3'),
    t('trackTableRow4'),
    t('trackTableRow5'),
  ]
  const notToDoItems = ['notToDo1', 'notToDo2', 'notToDo3', 'notToDo4', 'notToDo5', 'notToDo6', 'notToDo7'] as const
  const ruleItems = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6', 'rule7'] as const
  const discordChannels = ['discordCh1', 'discordCh2', 'discordCh3', 'discordCh4'] as const
  const criteriaItems = ['judgingC1', 'judgingC2', 'judgingC3'] as const

  return (
    <div className="flex flex-col gap-6">
      {/* Singapore label */}
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{
            background: 'rgba(255, 217, 15, 0.1)',
            color: '#FFD90F',
            border: '1px solid rgba(255, 217, 15, 0.3)',
          }}
        >
          Singapore
        </span>
      </div>

      {/* 1. Problem Statement */}
      <Section title={t('problemStatements')}>
        <p className="mb-5 text-sm font-medium" style={{ color: '#ff6b6b' }}>{t('problemStatementsIntro')}</p>

        <div className="flex flex-col gap-7">
          <TrackBlock
            title={t('track1Title')}
            tagline={t('track1Tagline')}
            desc={t('track1Desc')}
            bullets={track1Bullets}
            closing={t('track1Stack')}
            think={t('track1Think')}
          />
          <TrackBlock
            title={t('track2Title')}
            tagline={t('track2Tagline')}
            desc={t('track2Desc')}
            bullets={track2Bullets}
            closing={t('track2CodexRequired')}
            think={t('track2Think')}
          />

          <div>
            <h3 className="mb-3 text-base font-bold">{t('trackTableTitle')}</h3>
            <TrackTable rows={trackTableRows} />
            <p className="mt-3 text-sm" style={{ color: '#8892b0' }}>{t('trackTableNote')}</p>
          </div>
        </div>
      </Section>

      {/* 2. NOT TO DO */}
      <Section title={t('notToDo')}>
        <p className="mb-3 text-sm font-medium" style={{ color: '#ff6b6b' }}>{t('notToDoIntro')}</p>
        <ul className="flex flex-col gap-1.5">
          {notToDoItems.map((key) => (
            <li key={key} className="text-sm" style={{ color: '#8892b0' }}>• {t(key)}</li>
          ))}
        </ul>
      </Section>

      {/* 3. Connect with the Community */}
      <Section title={t('discord')}>
        <p className="mb-3 text-sm">
          <a
            href={t('discordLink')}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: '#64ffda' }}
          >
            {t('discordIntro')}
          </a>
        </p>
        <ul className="flex flex-col gap-1.5">
          {discordChannels.map((key) => (
            <li key={key} className="text-sm" style={{ color: '#8892b0' }}>{t(key)}</li>
          ))}
        </ul>
      </Section>

      {/* 4. Rules */}
      <Section title={t('rules')}>
        <ul className="mb-4 flex flex-col gap-2">
          {ruleItems.map((key) => (
            <li key={key} className="text-sm" style={{ color: '#8892b0' }}>• {t(key)}</li>
          ))}
        </ul>
        <div
          className="rounded-lg px-5 py-4"
          style={{ background: 'rgba(100, 255, 218, 0.06)', border: '1px solid rgba(100, 255, 218, 0.2)' }}
        >
          <p className="mb-1 text-sm font-bold" style={{ color: '#64ffda' }}>{t('mediaNotice')}</p>
          <p className="text-sm" style={{ color: '#8892b0' }}>{t('mediaNoticeText')}</p>
        </div>
      </Section>

      {/* 5. Judging */}
      <Section title={t('judging')}>
        <p className="mb-2 text-sm" style={{ color: '#8892b0' }}>{t('judgingDesc')}</p>
        <p className="mb-4 text-sm font-medium" style={{ color: '#ff6b6b' }}>{t('judgingNote')}</p>

        <h3 className="mb-2 text-base font-bold">{t('judgingScorecardTitle')}</h3>
        <p className="mb-2 text-sm" style={{ color: '#8892b0' }}>{t('judgingScorecardDesc')}</p>
        <p className="mb-2 text-sm" style={{ color: '#8892b0' }}>
          <span className="font-medium" style={{ color: '#FFD90F' }}>Columns:</span>{' '}
          {t('judgingScoreHeader').split('|').join(' · ')}
        </p>
        <p className="mb-4 text-sm font-bold" style={{ color: '#FFD90F' }}>{t('judgingTotal')}</p>

        <ul className="mb-4 flex flex-col gap-2">
          {criteriaItems.map((key) => {
            const parts = t(key).split('|')
            return (
              <li key={key} className="text-sm" style={{ color: '#8892b0' }}>
                • <span className="font-bold" style={{ color: '#FFD90F' }}>{parts[0]}</span> — {parts[1]}
              </li>
            )
          })}
        </ul>

        <h3 className="mb-2 text-base font-bold">{t('judgingTracksTitle')}</h3>
        <p className="text-sm" style={{ color: '#8892b0' }}>{t('judgingTracks')}</p>
      </Section>

      {/* Contact */}
      <p className="text-center text-sm" style={{ color: '#8892b0' }}>
        {t('contact')}
      </p>
    </div>
  )
}
