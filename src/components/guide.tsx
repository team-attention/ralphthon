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

function TableRow({ data, cols }: { data: string; cols: number }) {
  const parts = data.split('|')
  if (cols === 2) {
    return (
      <div className="grid grid-cols-[140px_1fr] items-center gap-2 border-b px-4 py-3 text-sm last:border-b-0">
        <span className="font-bold">{parts[0]}</span>
        <span>{parts[1]}</span>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-[140px_60px_1fr] items-center gap-2 border-b px-4 py-3 text-sm last:border-b-0">
      <span className="font-bold">{parts[0]}</span>
      <span style={{ color: '#FFD90F' }}>{parts[1]}</span>
      <span style={{ color: '#8892b0' }}>{parts[2]}</span>
    </div>
  )
}

export function Guide() {
  const t = useTranslations('guide')

  const notToDoItems = ['notToDo1', 'notToDo2', 'notToDo3', 'notToDo4', 'notToDo5', 'notToDo6', 'notToDo7'] as const
  const scheduleItems = ['sch1', 'sch2', 'sch3', 'sch4', 'sch5', 'sch6', 'sch7', 'sch8', 'sch9', 'sch10', 'sch11'] as const
  const ruleItems = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6'] as const
  const subItems = ['sub1', 'sub2', 'sub3', 'sub4'] as const
  const judgingCriteria = ['judgingC1', 'judgingC2', 'judgingC3', 'judgingC4'] as const
  const prizeItems = ['prize1', 'prize2', 'prize3'] as const
  const speakerItems = ['speaker1', 'speaker2'] as const
  const judgeItems = ['judge1', 'judge2', 'judge3', 'judge4', 'judge5', 'judge6', 'judge7', 'judge8'] as const
  const resItems = ['res1', 'res2', 'res3'] as const

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <p className="text-sm" style={{ color: '#8892b0' }}>
        {t('welcome')}
      </p>

      {/* Problem Statements */}
      <Section title={t('problemStatements')}>
        <p className="mb-4 text-sm" style={{ color: '#8892b0' }}>{t('problemStatementsIntro')}</p>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 text-base font-bold">{t('s1Title')}</h3>
            <p className="text-sm" style={{ color: '#8892b0' }}>{t('s1Desc')}</p>
          </div>

          <div>
            <h3 className="mb-2 text-base font-bold">{t('s2Title')}</h3>
            <p className="mb-3 text-sm" style={{ color: '#8892b0' }}>{t('s2Desc')}</p>
            <ul className="ml-4 flex flex-col gap-1.5">
              <li className="text-sm" style={{ color: '#8892b0' }}>• {t('s2Ex1')}</li>
              <li className="text-sm" style={{ color: '#8892b0' }}>• {t('s2Ex2')}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-base font-bold">{t('s3Title')}</h3>
            <p className="mb-2 text-sm" style={{ color: '#8892b0' }}>{t('s3Desc')}</p>
            <p className="text-sm font-medium" style={{ color: '#64ffda' }}>{t('s3Keywords')}</p>
          </div>
        </div>
      </Section>

      {/* NOT TO DO */}
      <Section title={t('notToDo')}>
        <p className="mb-3 text-sm font-medium" style={{ color: '#ff6b6b' }}>{t('notToDoIntro')}</p>
        <ul className="flex flex-col gap-1.5">
          {notToDoItems.map((key) => (
            <li key={key} className="text-sm" style={{ color: '#8892b0' }}>• {t(key)}</li>
          ))}
        </ul>
      </Section>

      {/* Getting Ready */}
      <Section title={t('gettingReady')}>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-bold">{t('venue')}</p>
            <ul className="mt-1 flex flex-col gap-1">
              <li className="text-sm" style={{ color: '#8892b0' }}>• {t('venueNote1')}</li>
              <li className="text-sm" style={{ color: '#8892b0' }}>• {t('venueNote2')}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold">{t('wifiLabel')}</p>
            <p className="text-sm" style={{ color: '#8892b0' }}>{t('wifiNote')}</p>
          </div>
        </div>
      </Section>

      {/* Discord */}
      <Section title={t('discord')}>
        <p className="mb-3 text-sm">
          <a href={t('discordLink')} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#64ffda' }}>
            {t('discordIntro')}
          </a>
        </p>
        <ul className="flex flex-col gap-1.5">
          {(['discordCh1', 'discordCh2', 'discordCh3', 'discordCh4'] as const).map((key) => (
            <li key={key} className="text-sm" style={{ color: '#8892b0' }}>{t(key)}</li>
          ))}
        </ul>
      </Section>

      {/* Schedule */}
      <Section title={t('schedule')}>
        <div className="flex flex-col">
          <div className="grid grid-cols-[140px_1fr] gap-2 border-b px-4 pb-2 text-xs font-medium uppercase tracking-wide" style={{ color: '#8892b0' }}>
            <span>{t('scheduleTime')}</span>
            <span>{t('scheduleActivity')}</span>
          </div>
          {scheduleItems.map((key) => {
            const [time, activity] = t(key).split('|')
            const isLobster = key === 'sch4'
            return (
              <div
                key={key}
                className="grid grid-cols-[140px_1fr] items-center gap-2 border-b px-4 py-3 text-sm last:border-b-0"
                style={isLobster ? { background: 'rgba(255, 217, 15, 0.06)', borderLeft: '3px solid #FFD90F' } : undefined}
              >
                <span className="font-mono text-xs font-bold" style={isLobster ? { color: '#FFD90F' } : undefined}>{time}</span>
                <span>{isLobster && '🦞 '}{activity}</span>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Rules */}
      <Section title={t('rules')}>
        <ul className="flex flex-col gap-2">
          {ruleItems.map((key) => (
            <li key={key} className="text-sm" style={{ color: '#8892b0' }}>• {t(key)}</li>
          ))}
        </ul>
      </Section>

      {/* Submission */}
      <Section title={t('submission')}>
        <p className="mb-3 text-sm" style={{ color: '#8892b0' }}>{t('submissionIntro')}</p>
        <ol className="ml-4 flex flex-col gap-1.5">
          {subItems.map((key, i) => (
            <li key={key} className="text-sm" style={{ color: '#8892b0' }}>{i + 1}. {t(key)}</li>
          ))}
        </ol>
        <p className="mt-3 text-sm" style={{ color: '#8892b0' }}>{t('submissionNote')}</p>
      </Section>

      {/* Judging */}
      <Section title={t('judging')}>
        <h3 className="mb-2 text-base font-bold">{t('judgingR1')}</h3>
        <p className="mb-2 text-sm" style={{ color: '#8892b0' }}>{t('judgingR1Desc')}</p>
        <p className="mb-4 text-sm font-medium" style={{ color: '#ff6b6b' }}>{t('judgingNote')}</p>
        <div className="mb-4 flex flex-col rounded-lg border">
          {judgingCriteria.map((key) => (
            <TableRow key={key} data={t(key)} cols={3} />
          ))}
        </div>
        <h3 className="mb-2 text-base font-bold">{t('judgingR2')}</h3>
        <p className="text-sm" style={{ color: '#8892b0' }}>{t('judgingR2Desc')}</p>
      </Section>

      {/* Prizes */}
      <Section title={t('prizes')}>
        <p className="mb-3 text-sm" style={{ color: '#8892b0' }}>{t('prizeSponsor')}</p>
        <div className="flex flex-col rounded-lg border">
          {prizeItems.map((key) => (
            <TableRow key={key} data={t(key)} cols={2} />
          ))}
        </div>
      </Section>

      {/* Speakers */}
      <Section title={t('speakers')}>
        <div className="mb-3 flex flex-col rounded-lg border">
          {speakerItems.map((key) => (
            <TableRow key={key} data={t(key)} cols={2} />
          ))}
        </div>
        <p className="text-sm" style={{ color: '#8892b0' }}>{t('speakersNote')}</p>
      </Section>

      {/* Judges */}
      <Section title={t('judges')}>
        <div className="flex flex-col rounded-lg border">
          {judgeItems.map((key) => (
            <TableRow key={key} data={t(key)} cols={2} />
          ))}
        </div>
      </Section>

      {/* Resources */}
      <Section title={t('resources')}>
        <h3 className="mb-2 text-sm font-bold">{t('resourcesCodex')}</h3>
        <ul className="flex flex-col gap-1.5">
          {resItems.map((key) => {
            const [label, url] = t(key).split('|')
            return (
              <li key={key}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: '#64ffda' }}>
                  {label}
                </a>
              </li>
            )
          })}
          <li className="text-sm" style={{ color: '#8892b0' }}>
            <span className="font-bold">{t('res4Label')}: </span>
            <code className="rounded bg-[#1a1a2e] px-1.5 py-0.5 text-xs" style={{ color: '#64ffda' }}>{t('res4Value')}</code>
          </li>
        </ul>
      </Section>

      {/* Contact */}
      <p className="text-center text-sm" style={{ color: '#8892b0' }}>
        {t('contact')}
      </p>
    </div>
  )
}
