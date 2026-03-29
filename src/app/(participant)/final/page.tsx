'use client'

import { useEffect, useState } from 'react'

const SCHEDULE = {
  start: '19:20',
  end: '20:30',
  perTeam: 10, // minutes total
  presentation: 3, // minutes
  qa: 7, // minutes (rest of 10)
}

const JUDGES = ['한기용', '이태양', '제프리', '이재규', '이상희']

const TEAMS = [
  'Ha-fam',
  'Supermango',
  'polysona',
  // remaining teams TBD - add as selected
]

function getTimeSlot(index: number): string {
  const [startH, startM] = SCHEDULE.start.split(':').map(Number)
  const totalMin = startH * 60 + startM + index * SCHEDULE.perTeam
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function getCurrentSlotIndex(now: Date): number {
  const [startH, startM] = SCHEDULE.start.split(':').map(Number)
  const startTotal = startH * 60 + startM
  const nowTotal = now.getHours() * 60 + now.getMinutes()
  if (nowTotal < startTotal) return -1
  return Math.floor((nowTotal - startTotal) / SCHEDULE.perTeam)
}

export default function FinalPage() {
  const now = useNow()
  const currentSlot = getCurrentSlotIndex(now)
  const timeStr = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div className="min-h-screen grid-bg grain-overlay flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-6">
        <h1
          className="font-display text-6xl md:text-8xl text-glow-yellow"
          style={{ color: '#FFD90F' }}
        >
          FINAL ROUND
        </h1>
        <p className="text-xl mt-2" style={{ color: '#8892b0' }}>
          Seoul Hackathon Presentations
        </p>
        <div
          className="font-display text-3xl mt-4"
          style={{ color: '#e2e8f0' }}
        >
          {timeStr}
        </div>
      </div>

      {/* Schedule Info Bar */}
      <div className="max-w-4xl mx-auto w-full px-4 mb-8">
        <div
          className="glass-card rounded-xl p-5 flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8892b0' }}>
              Start
            </div>
            <div className="font-display text-3xl" style={{ color: '#FFD90F' }}>
              7:20 PM
            </div>
          </div>
          <div
            className="hidden md:block text-3xl"
            style={{ color: 'rgba(255,217,15,0.3)' }}
          >
            &rarr;
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8892b0' }}>
              End
            </div>
            <div className="font-display text-3xl" style={{ color: '#E63946' }}>
              8:30 PM
            </div>
          </div>
          <div
            className="w-px h-10 hidden md:block"
            style={{ background: 'rgba(255,217,15,0.15)' }}
          />
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8892b0' }}>
              Format
            </div>
            <div className="text-lg font-bold" style={{ color: '#e2e8f0' }}>
              <span style={{ color: '#FFD90F' }}>3min</span>{' '}
              <span style={{ color: '#8892b0' }}>Pitch</span>
              {' + '}
              <span style={{ color: '#45B649' }}>Q&A</span>
            </div>
          </div>
          <div
            className="w-px h-10 hidden md:block"
            style={{ background: 'rgba(255,217,15,0.15)' }}
          />
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8892b0' }}>
              Per Team
            </div>
            <div className="font-display text-3xl" style={{ color: '#e2e8f0' }}>
              10min
            </div>
          </div>
        </div>
      </div>

      {/* Presentation Order */}
      <div className="max-w-4xl mx-auto w-full px-4 flex-1">
        <h2
          className="font-display text-2xl mb-4"
          style={{ color: '#FFD90F' }}
        >
          Presentation Order
        </h2>
        <div className="space-y-3">
          {TEAMS.map((team, idx) => {
            const time = getTimeSlot(idx)
            const isActive = currentSlot === idx
            const isDone = currentSlot > idx

            return (
              <div
                key={idx}
                className="glass-card rounded-xl p-4 flex items-center gap-4 transition-all duration-500"
                style={{
                  borderColor: isActive
                    ? 'rgba(255,217,15,0.5)'
                    : 'rgba(255,217,15,0.08)',
                  boxShadow: isActive
                    ? '0 0 30px rgba(255,217,15,0.15)'
                    : 'none',
                  opacity: isDone ? 0.4 : 1,
                }}
              >
                {/* Number */}
                <div
                  className="font-display text-3xl w-12 text-center shrink-0"
                  style={{
                    color: isActive ? '#FFD90F' : isDone ? '#8892b0' : '#e2e8f0',
                  }}
                >
                  {idx + 1}
                </div>

                {/* Time */}
                <div
                  className="text-sm font-mono w-16 shrink-0"
                  style={{ color: '#8892b0' }}
                >
                  {time}
                </div>

                {/* Team Name */}
                <div className="flex-1">
                  <span
                    className="text-xl font-bold"
                    style={{
                      color: isActive ? '#FFD90F' : '#e2e8f0',
                    }}
                  >
                    {team}
                  </span>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {isDone && (
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'rgba(69,182,73,0.2)', color: '#45B649' }}
                    >
                      Done
                    </span>
                  )}
                  {isActive && (
                    <span
                      className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{
                        background: 'rgba(255,217,15,0.2)',
                        color: '#FFD90F',
                        animation: 'yellowGlow 2s ease-in-out infinite',
                      }}
                    >
                      NOW
                    </span>
                  )}
                  {!isDone && !isActive && (
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#8892b0' }}
                    >
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Judges */}
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <h2
          className="font-display text-2xl mb-4"
          style={{ color: '#FFD90F' }}
        >
          Judges
        </h2>
        <div className="flex flex-wrap gap-3">
          {JUDGES.map((judge) => (
            <div
              key={judge}
              className="glass-card rounded-lg px-5 py-3 text-center"
            >
              <span className="text-lg font-bold" style={{ color: '#e2e8f0' }}>
                {judge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
