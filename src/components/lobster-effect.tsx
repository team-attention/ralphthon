'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

interface LobsterEffectProps {
  active: boolean
  onDismiss: () => void
}

function LobsterParticle({ delay, left, size, duration }: { delay: number; left: number; size: number; duration: number }) {
  return (
    <div
      className="fixed pointer-events-none select-none z-50"
      style={{
        left: `${left}%`,
        top: '-50px',
        fontSize: `${size}px`,
        animation: `lobsterRain ${duration}s linear ${delay}s forwards`,
      }}
    >
      {'\u{1F99E}'}
    </div>
  )
}

export function LobsterEffect({ active, onDismiss }: LobsterEffectProps) {
  const t = useTranslations('lobster')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; left: number; size: number; duration: number }>>([])

  useEffect(() => {
    if (active) {
      // Generate multiple waves of particles for 10s effect
      const allParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 6, // spread across 6s so particles rain throughout
        left: Math.random() * 100,
        size: 20 + Math.random() * 40,
        duration: 2.5 + Math.random() * 2.5,
      }))
      setParticles(allParticles) // eslint-disable-line react-hooks/set-state-in-effect

      timerRef.current = setTimeout(() => {
        onDismiss()
        setParticles([])
      }, 10000)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [active, onDismiss])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(230, 57, 70, 0.3) 0%, rgba(10, 10, 26, 0.9) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Lobster rain */}
      {particles.map((p) => (
        <LobsterParticle key={p.id} delay={p.delay} left={p.left} size={p.size} duration={p.duration} />
      ))}

      {/* Center content */}
      <div className="relative flex flex-col items-center gap-6">
        <div
          className="text-8xl sm:text-9xl"
          style={{
            animation: 'lobsterPulse 1s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(230, 57, 70, 0.8))',
          }}
        >
          {'\u{1F99E}'}
        </div>
        <h2
          className="font-display text-5xl tracking-wider sm:text-6xl lg:text-7xl"
          style={{
            color: '#E63946',
            animation: 'lobsterGlow 1.5s ease-in-out infinite, shake 0.5s ease-in-out 3',
          }}
        >
          {t('activated')}
        </h2>
        <p
          className="font-display text-xl tracking-wide"
          style={{
            color: 'rgba(255, 217, 15, 0.9)',
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          Your team has been boosted!
        </p>

        <p
          className="mt-4 text-sm"
          style={{ color: '#8892b0', animation: 'blink 2s ease-in-out infinite' }}
        >
          auto-dismissing...
        </p>
      </div>
    </div>
  )
}
