'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const TIERS = [
  { label: '$30', tier: 's3' },
  { label: 'Pay what you want', tier: 's4' },
] as const

const EVENTS = [
  { name: 'Ralphthon SF', date: 'Mar 2026' },
  { name: 'Ralphthon Seoul #2', date: 'Mar 2026' },
  { name: 'Ralphthon Seoul #1', date: 'Feb 2026' },
  { name: 'Skillthon: Claude Code Plugin', date: 'Jan 2026' },
  { name: 'AI Builders Meetup #2', date: 'Dec 2025' },
  { name: 'AI Builders Meetup #1', date: 'Nov 2025' },
]

function SponsorTierButtons() {
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) setLoading(null)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  async function handleClick(tier: string) {
    setLoading(tier)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {TIERS.map((t) => (
        <button
          key={t.tier}
          onClick={() => handleClick(t.tier)}
          disabled={loading !== null}
          className="group relative overflow-hidden rounded-lg px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          style={{
            background:
              t.tier === 's4'
                ? 'linear-gradient(135deg, rgba(100, 255, 218, 0.15), rgba(255, 217, 15, 0.15))'
                : 'rgba(255, 217, 15, 0.1)',
            border:
              t.tier === 's4'
                ? '1px solid rgba(100, 255, 218, 0.4)'
                : '1px solid rgba(255, 217, 15, 0.3)',
            color: t.tier === 's4' ? '#64ffda' : '#FFD90F',
            minWidth: t.tier === 's4' ? '220px' : '100px',
          }}
        >
          <span className="relative z-10">
            {loading === t.tier ? '...' : t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

function SuccessBanner() {
  return (
    <div
      className="mx-auto mb-8 max-w-2xl rounded-xl px-6 py-4 text-center"
      style={{
        background: 'rgba(100, 255, 218, 0.1)',
        border: '1px solid rgba(100, 255, 218, 0.3)',
      }}
    >
      <p className="text-lg font-medium" style={{ color: '#64ffda' }}>
        Thank you for your support!
      </p>
      <p className="mt-1 text-sm" style={{ color: '#8892b0' }}>
        Your contribution helps us grow the AI builder network worldwide.
      </p>
    </div>
  )
}

function ScrollHint() {
  return (
    <button
      onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
      className="mt-12 flex cursor-pointer flex-col items-center gap-2 opacity-50 transition-opacity hover:opacity-80"
    >
      <p className="text-xs tracking-widest uppercase" style={{ color: '#8892b0' }}>
        Learn more about us
      </p>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="animate-bounce"
      >
        <path
          d="M10 4v12m0 0l-4-4m4 4l4-4"
          stroke="#8892b0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default function SupportPage() {
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1117 100%)' }}
    >
      {/* ── Hero: full viewport ── */}
      <section className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-6 text-center">
        {isSuccess && <SuccessBanner />}

        <h1
          className="font-display text-5xl tracking-wider sm:text-6xl md:text-7xl"
          style={{ color: '#FFD90F' }}
        >
          Support the
          <br />
          AI Builder Network
        </h1>

        <p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed sm:text-xl"
          style={{ color: '#8892b0' }}
        >
          Help us connect AI builders worldwide.
          <br />
          Seoul-based, globally growing.
        </p>

        <div className="mt-10">
          <SponsorTierButtons />
        </div>

        <ScrollHint />
      </section>

      {/* ── Detail sections ── */}
      <div className="mx-auto max-w-3xl px-6 pb-24">
        {/* Who we are */}
        <section id="about" className="mb-20 scroll-mt-20">
          <h2
            className="mb-4 font-display text-2xl tracking-wider"
            style={{ color: '#FFD90F' }}
          >
            Who we are
          </h2>
          <p className="leading-relaxed" style={{ color: '#ccd6f6' }}>
            <a
              href="https://team-attention.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#64ffda', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Team Attention
            </a>{' '}
            is a Seoul-based network building bridges between AI builders
            across the globe. We bring people together to push what&apos;s possible
            with AI, share what they&apos;re working on, and learn from each other.
          </p>
        </section>

        {/* What we've done */}
        <section className="mb-20">
          <h2
            className="mb-6 font-display text-2xl tracking-wider"
            style={{ color: '#FFD90F' }}
          >
            What we&apos;ve done
          </h2>
          <div className="relative pl-8">
            <div
              className="absolute left-[4px] top-0 h-full w-px"
              style={{ background: 'rgba(255, 217, 15, 0.2)' }}
            />
            {EVENTS.map((event, i) => (
              <div key={i} className="relative mb-6 last:mb-0">
                <div
                  className="absolute -left-8 top-1.5 h-[10px] w-[10px] rounded-full"
                  style={{
                    background: i === 0 ? '#FFD90F' : '#8892b0',
                    boxShadow: i === 0 ? '0 0 8px rgba(255, 217, 15, 0.4)' : 'none',
                  }}
                />
                <p className="font-medium" style={{ color: '#ccd6f6' }}>
                  {event.name}
                </p>
                <p className="text-sm" style={{ color: '#8892b0' }}>
                  {event.date}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Where your support goes */}
        <section className="mb-20">
          <h2
            className="mb-4 font-display text-2xl tracking-wider"
            style={{ color: '#FFD90F' }}
          >
            Where your support goes
          </h2>
          <ul className="space-y-3" style={{ color: '#ccd6f6' }}>
            <li className="flex items-start gap-3">
              <span style={{ color: '#64ffda' }}>-&gt;</span>
              <span>Venue & logistics for hackathons and meetups</span>
            </li>
            <li className="flex items-start gap-3">
              <span style={{ color: '#64ffda' }}>-&gt;</span>
              <span>API credits and infrastructure for participants</span>
            </li>
            <li className="flex items-start gap-3">
              <span style={{ color: '#64ffda' }}>-&gt;</span>
              <span>Growing the network to new cities</span>
            </li>
          </ul>
        </section>

        {/* Bottom CTA */}
        <section className="text-center">
          <p
            className="mb-6 text-lg"
            style={{ color: '#8892b0' }}
          >
            Every contribution helps us keep building.
          </p>
          <SponsorTierButtons />
        </section>
      </div>
    </div>
  )
}
