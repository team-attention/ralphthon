'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EventInfo, TimelineSchedule } from '@/components/timeline'

type City = 'SF' | 'Seoul'

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
  const [city, setCity] = useState<City>('SF')

  const notToDoItems = ['notToDo1', 'notToDo2', 'notToDo3', 'notToDo4', 'notToDo5', 'notToDo6', 'notToDo7'] as const
  const ruleItems = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6'] as const
  const subItems = ['sub1', 'sub2', 'sub3', 'sub4'] as const
  const judgingCriteria = ['judgingC1', 'judgingC2', 'judgingC3', 'judgingC4'] as const
  const prizeItems = ['prize1', 'prize2', 'prize3', 'prize4'] as const
  const speakerItems = ['speaker1', 'speaker2', 'speaker3', 'speaker4'] as const
  const judgeItems = ['judge1', 'judge2', 'judge3', 'judge4', 'judge5', 'judge6', 'judge7', 'judge8', 'judge9', 'judge10', 'judge11', 'judge12'] as const

  return (
    <div className="flex flex-col gap-6">
      {/* SF / Seoul tabs */}
      <div className="flex gap-2">
        <Button variant={city === 'SF' ? 'default' : 'outline'} onClick={() => setCity('SF')} size="sm">SF</Button>
        <Button variant={city === 'Seoul' ? 'default' : 'outline'} onClick={() => setCity('Seoul')} size="sm">Seoul</Button>
      </div>
      <EventInfo city={city} />
      <TimelineSchedule city={city} />

      {city === 'SF' && <>
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
        <div className="mb-4 flex flex-col rounded-lg border">
          {prizeItems.map((key) => (
            <TableRow key={key} data={t(key)} cols={2} />
          ))}
        </div>
        <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(255, 217, 15, 0.06)', border: '1px solid rgba(255, 217, 15, 0.2)' }}>
          <p className="mb-1 text-sm font-bold" style={{ color: '#FFD90F' }}>{t('creditFormNote')}</p>
          <a href={t('creditFormUrl')} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: '#64ffda' }}>
            {t('creditFormUrl')}
          </a>
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

      {/* Contact */}
      <p className="text-center text-sm" style={{ color: '#8892b0' }}>
        {t('contact')}
      </p>
      </>}
    </div>
  )
}
