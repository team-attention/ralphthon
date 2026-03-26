'use client'

import { useEffect, useState } from 'react'

const RALPH_QUOTES = [
  "I'm helping!",
  "Me fail English? That's unpossible!",
  "I'm in danger!",
  "I bent my wookie",
  "My cat's breath smells like cat food",
  "Go banana!",
  "I'm learnding!",
  "When I grow up, I wanna be a principal or a caterpillar",
  "I found a moon rock in my nose!",
  "That's where I saw the leprechaun",
]

function FloatingLobster({ offset, duration, left, startY }: { offset: number; duration: number; left: number; startY: number }) {
  return (
    <div
      className="fixed text-2xl pointer-events-none select-none z-10"
      style={{
        left: `${left}%`,
        top: `${startY}vh`,
        animation: `drift ${duration}s linear ${-offset}s infinite`,
      }}
    >
      {'\u{1F99E}'}
    </div>
  )
}

function RalphQuote() {
  const [quote, setQuote] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function showQuote() {
      setQuote(RALPH_QUOTES[Math.floor(Math.random() * RALPH_QUOTES.length)])
      setVisible(true)
      setTimeout(() => setVisible(false), 4000)
    }

    const interval = setInterval(showQuote, 12000)
    const initialTimeout = setTimeout(showQuote, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(initialTimeout)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-30 max-w-xs rounded-lg px-4 py-3 font-display text-lg glass"
      style={{
        color: '#FFD90F',
        animation: 'fadeInUp 0.4s ease-out',
      }}
    >
      <span className="mr-2 text-xl">{'\u{1F476}'}</span>
      &quot;{quote}&quot;
    </div>
  )
}

export function HackathonBg({ showQuotes = true }: { showQuotes?: boolean }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const lobsters = [
    { offset: 0, duration: 17, left: 10, startY: 80 },
    { offset: 7, duration: 23, left: 30, startY: 55 },
    { offset: 13, duration: 19, left: 55, startY: 35 },
    { offset: 4, duration: 26, left: 75, startY: 70 },
    { offset: 10, duration: 21, left: 90, startY: 45 },
  ]

  return (
    <>
      {/* Grid background */}
      <div className="fixed inset-0 z-0 grid-bg" />

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Floating lobsters */}
      {mounted && lobsters.map((props, i) => (
        <FloatingLobster key={i} {...props} />
      ))}

      {/* Ralph quotes */}
      {showQuotes && <RalphQuote />}
    </>
  )
}
