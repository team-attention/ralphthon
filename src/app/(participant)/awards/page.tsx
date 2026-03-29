'use client'

import { useState, useCallback, useEffect } from 'react'

// ─── Fill in team names when ready ───
const AWARDS = [
  { rank: '🥉', label: '3rd Place', team: null as string | null },
  { rank: '🥈', label: '2nd Place', team: null as string | null },
  { rank: '🥇', label: '1st Place', team: null as string | null },
]

function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<
    { id: number; x: number; color: string; delay: number; size: number; drift: number }[]
  >([])

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticles([])
      return
    }
    const colors = ['#FFD90F', '#E63946', '#45B649', '#ffffff', '#FFD90F', '#E63946']
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
        drift: (Math.random() - 0.5) * 100,
      }))
    )
  }, [active])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animation: `confettiFall 2.5s ease-in ${p.delay}s forwards`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function DrumrollOverlay({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [visible, onDone])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center" style={{ animation: 'drumrollPulse 0.4s ease-in-out infinite' }}>
        <div className="font-display text-6xl md:text-9xl" style={{ color: '#FFD90F' }}>
          . . .
        </div>
      </div>
    </div>
  )
}

export default function AwardsPage() {
  const [revealedCount, setRevealedCount] = useState(0)
  const [drumroll, setDrumroll] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [justRevealed, setJustRevealed] = useState<number | null>(null)

  const total = AWARDS.length
  const allRevealed = revealedCount >= total

  const handleReveal = useCallback(() => {
    if (allRevealed || drumroll) return
    setDrumroll(true)
  }, [allRevealed, drumroll])

  const handleDrumrollDone = useCallback(() => {
    setDrumroll(false)
    const idx = revealedCount
    setJustRevealed(idx)
    setRevealedCount((c) => c + 1)
    setConfetti(true)
    setTimeout(() => setConfetti(false), 3000)
    setTimeout(() => setJustRevealed(null), 2000)
  }, [revealedCount])

  const handleReset = useCallback(() => {
    setRevealedCount(0)
    setJustRevealed(null)
    setConfetti(false)
    setDrumroll(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleReveal()
      }
      if (e.code === 'KeyR' && e.shiftKey) handleReset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleReveal, handleReset])

  return (
    <div className="min-h-screen grid-bg grain-overlay flex flex-col items-center justify-center px-4">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
        @keyframes drumrollPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes revealGlow {
          0% { box-shadow: 0 0 0 0 rgba(255, 217, 15, 0); }
          50% { box-shadow: 0 0 60px 20px rgba(255, 217, 15, 0.4); }
          100% { box-shadow: 0 0 30px 10px rgba(255, 217, 15, 0.15); }
        }
        @keyframes revealScale {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes firstPlaceGlow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(255, 217, 15, 0.3), 0 0 60px rgba(255, 217, 15, 0.15);
            border-color: rgba(255, 217, 15, 0.5);
          }
          50% {
            box-shadow: 0 0 50px rgba(255, 217, 15, 0.5), 0 0 100px rgba(255, 217, 15, 0.25);
            border-color: rgba(255, 217, 15, 0.8);
          }
        }
      `}</style>

      <Confetti active={confetti} />
      <DrumrollOverlay visible={drumroll} onDone={handleDrumrollDone} />

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-[0.3em] mb-3" style={{ color: '#E63946' }}>
          Ralphthon Seoul 2026
        </p>
        <h1 className="font-display text-6xl md:text-8xl text-glow-yellow" style={{ color: '#FFD90F' }}>
          AWARDS
        </h1>
      </div>

      {/* Awards — displayed 3rd → 2nd → 1st (top to bottom) */}
      <div className="w-full max-w-2xl space-y-5 mb-12">
        {AWARDS.map((award, idx) => {
          const revealed = idx < revealedCount
          const isFirst = idx === total - 1
          const isJustNow = justRevealed === idx

          return (
            <div
              key={idx}
              className="glass-card rounded-2xl transition-all duration-700"
              style={{
                borderColor: revealed
                  ? isFirst
                    ? 'rgba(255, 217, 15, 0.6)'
                    : 'rgba(255, 217, 15, 0.3)'
                  : 'rgba(255, 255, 255, 0.05)',
                animation: isJustNow
                  ? 'revealGlow 1.5s ease-out'
                  : isFirst && revealed
                    ? 'firstPlaceGlow 3s ease-in-out infinite'
                    : 'none',
                opacity: revealed ? 1 : 0.4,
              }}
            >
              <div className="flex items-center gap-5 p-6 md:p-8">
                <div
                  className="text-5xl md:text-6xl w-20 text-center shrink-0"
                  style={{
                    filter: revealed ? 'none' : 'grayscale(1) brightness(0.3)',
                    transition: 'filter 0.5s ease',
                  }}
                >
                  {award.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs uppercase tracking-[0.2em] mb-1"
                    style={{ color: revealed ? '#FFD90F' : '#8892b0' }}
                  >
                    {award.label}
                  </div>
                  {revealed ? (
                    <div
                      className="font-display text-4xl md:text-5xl truncate"
                      style={{
                        color: isFirst ? '#FFD90F' : '#e2e8f0',
                        animation: isJustNow ? 'revealScale 0.6s ease-out' : 'none',
                        textShadow: isFirst ? '0 0 20px rgba(255, 217, 15, 0.5)' : 'none',
                      }}
                    >
                      {award.team ?? 'TBA'}
                    </div>
                  ) : (
                    <div className="font-display text-4xl md:text-5xl" style={{ color: '#8892b0' }}>
                      ? ? ?
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Button */}
      {!allRevealed ? (
        <button
          onClick={handleReveal}
          className="font-display text-2xl px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: 'rgba(255, 217, 15, 0.15)',
            border: '2px solid rgba(255, 217, 15, 0.4)',
            color: '#FFD90F',
            textShadow: '0 0 10px rgba(255, 217, 15, 0.3)',
          }}
        >
          REVEAL
        </button>
      ) : (
        <div
          className="font-display text-4xl text-center"
          style={{ color: '#FFD90F', animation: 'yellowGlow 2s ease-in-out infinite' }}
        >
          Congratulations!
        </div>
      )}
    </div>
  )
}
