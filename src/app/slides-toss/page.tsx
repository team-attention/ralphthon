'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { HackathonBg } from '@/components/hackathon-bg'
import { CurrentSlide } from './slide-content'
import { slideIds } from './slide-data'

function clampSlide(index: number) {
  return Math.max(0, Math.min(slideIds.length - 1, index))
}

function findInitialSlide() {
  if (typeof window === 'undefined') return 0

  const fromQuery = new URLSearchParams(window.location.search).get('slide')
  const target = fromQuery || window.location.hash.replace(/^#/, '')
  const index = slideIds.findIndex((slide) => slide === target)

  return index >= 0 ? index : 0
}

export default function TossSlidesPage() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const syncFromLocation = () => setIndex(findInitialSlide())

    syncFromLocation()
    window.addEventListener('hashchange', syncFromLocation)
    return () => window.removeEventListener('hashchange', syncFromLocation)
  }, [])

  const goTo = useCallback((nextIndex: number) => {
    const clamped = clampSlide(nextIndex)
    setIndex(clamped)
    window.history.replaceState(null, '', `#${slideIds[clamped]}`)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) goTo(index + 1)
      if (['ArrowLeft', 'PageUp'].includes(event.key)) goTo(index - 1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo, index])

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-3 py-5 sm:px-6">
      <HackathonBg />
      <CurrentSlide index={index} />
      <div className="fixed left-1/2 top-2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background/70 px-3 py-2 backdrop-blur-xl sm:bottom-6 sm:top-auto sm:px-4" style={{ borderColor: 'rgba(255,217,15,0.18)' }}>
        <button type="button" onClick={() => goTo(index - 1)} className="rounded-full p-2 text-yellow transition hover:bg-yellow/10 disabled:opacity-35" disabled={index === 0} aria-label="Previous slide">
          <ArrowLeft className="size-4 sm:size-5" />
        </button>
        <div className="flex items-center gap-2">
          {slideIds.map((slide, slideIndex) => (
            <button
              key={slide}
              type="button"
              onClick={() => goTo(slideIndex)}
              aria-label={`Go to ${slide}`}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: slideIndex === index ? 28 : 10,
                background: slideIndex === index ? '#FFD90F' : 'rgba(136,146,176,0.45)',
              }}
            />
          ))}
        </div>
        <button type="button" onClick={() => goTo(index + 1)} className="rounded-full p-2 text-yellow transition hover:bg-yellow/10 disabled:opacity-35" disabled={index === slideIds.length - 1} aria-label="Next slide">
          <ArrowRight className="size-4 sm:size-5" />
        </button>
      </div>
    </main>
  )
}
