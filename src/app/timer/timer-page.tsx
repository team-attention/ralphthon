'use client'

import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HackathonBg } from '@/components/hackathon-bg'
import { LobsterEffect } from '@/components/lobster-effect'
import { ActiveTimerView, SetupView } from './timer-ui'

type TimerState =
  | { readonly kind: 'setup' }
  | { readonly kind: 'running'; readonly title: string; readonly totalSeconds: number; readonly deadline: number }
  | { readonly kind: 'finished'; readonly title: string; readonly totalSeconds: number }

const DEFAULT_TITLE = 'Ralph hands-off sprint'
const DEFAULT_MINUTES = '5'
const DEFAULT_SECONDS = '0'

function parseNumber(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

export function TimerPageView() {
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS)
  const [error, setError] = useState('')
  const [state, setState] = useState<TimerState>({ kind: 'setup' })
  const [remaining, setRemaining] = useState(0)
  const [showLobster, setShowLobster] = useState(false)

  const totalSeconds = useMemo(() => parseNumber(minutes) * 60 + Math.min(59, parseNumber(seconds)), [minutes, seconds])

  const reset = useCallback(() => {
    setState({ kind: 'setup' })
    setShowLobster(false)
    setRemaining(0)
  }, [])

  const updateMinutes = useCallback((value: string) => {
    setMinutes(parseNumber(value).toString())
  }, [])

  const updateSeconds = useCallback((value: string) => {
    setSeconds(Math.min(59, parseNumber(value)).toString())
  }, [])

  const start = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Timer title is required.')
      return
    }

    if (totalSeconds < 1) {
      setError('Set at least 1 second.')
      return
    }

    setError('')
    setRemaining(totalSeconds)
    setShowLobster(false)
    setState({ kind: 'running', title: trimmedTitle, totalSeconds, deadline: Date.now() + totalSeconds * 1000 })
  }, [title, totalSeconds])

  useEffect(() => {
    if (state.kind !== 'running') return

    const tick = () => {
      const nextRemaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000))
      setRemaining(nextRemaining)

      if (nextRemaining === 0) {
        setState({ kind: 'finished', title: state.title, totalSeconds: state.totalSeconds })
        setShowLobster(true)
      }
    }

    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [state])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-6">
      <HackathonBg />
      <LobsterEffect active={showLobster} onDismiss={() => setShowLobster(false)} />
      {state.kind === 'setup' ? (
        <SetupView
          title={title}
          minutes={minutes}
          seconds={seconds}
          error={error}
          onTitleChange={setTitle}
          onMinutesChange={updateMinutes}
          onSecondsChange={updateSeconds}
          onSubmit={start}
        />
      ) : (
        <ActiveTimerView state={state} remaining={remaining} onReset={reset} />
      )}
    </main>
  )
}
