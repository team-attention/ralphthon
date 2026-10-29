'use client'

import { useEffect, useState } from 'react'

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

export function HackathonBg({
  showLobsters = true,
}: {
  showLobsters?: boolean
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const lobsters = [
    { offset: 0, duration: 17, left: 10, startY: 80 },
    { offset: 3, duration: 20, left: 20, startY: 18 },
    { offset: 7, duration: 23, left: 30, startY: 55 },
    { offset: 11, duration: 24, left: 42, startY: 72 },
    { offset: 13, duration: 19, left: 55, startY: 35 },
    { offset: 5, duration: 22, left: 63, startY: 12 },
    { offset: 4, duration: 26, left: 75, startY: 70 },
    { offset: 15, duration: 18, left: 84, startY: 28 },
    { offset: 10, duration: 21, left: 90, startY: 45 },
    { offset: 8, duration: 25, left: 94, startY: 82 },
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
      {showLobsters && mounted && lobsters.map((props, i) => (
        <FloatingLobster key={i} {...props} />
      ))}
    </>
  )
}
