import type { FormEvent } from 'react'
import Image from 'next/image'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type ActiveTimerState = {
  readonly kind: 'running' | 'finished'
  readonly title: string
  readonly totalSeconds: number
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function Field({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly min: number
  readonly max?: number
  readonly onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-mono text-xs font-bold uppercase tracking-[0.24em]" style={{ color: '#8892b0' }}>
        {label}
      </Label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full min-w-0 rounded-lg border border-input bg-yellow/10 px-4 font-display text-4xl tracking-wider text-yellow transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </div>
  )
}

function BrandStack({ compact = false }: { readonly compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? 'gap-4' : 'gap-6'}`}>
      <Image
        src="/ralphthon.png"
        alt="Ralphthon"
        width={compact ? 96 : 180}
        height={compact ? 96 : 180}
        priority
        className={`${compact ? 'w-20 sm:w-24' : 'w-20 sm:w-32 lg:w-44'} h-auto`}
        style={{ animation: 'float 4s ease-in-out infinite' }}
      />
      <div className="h-12 w-px" style={{ background: 'rgba(255,217,15,0.22)' }} />
      <span className="rounded-lg bg-white/95 px-3 py-2 shadow-xl shadow-blue-500/10">
        <Image
          src="/toss-logo-primary.png"
          alt="Toss"
          width={compact ? 150 : 240}
          height={compact ? 75 : 120}
          priority
          className={`${compact ? 'w-28 sm:w-36' : 'w-28 sm:w-44 lg:w-60'} h-auto`}
        />
      </span>
    </div>
  )
}

function PresenterMark({ compact = false }: { readonly compact?: boolean }) {
  return (
    <div
      className={`inline-flex items-center rounded-full border bg-yellow/10 font-mono font-bold uppercase ${compact ? 'px-4 py-2 text-xs tracking-[0.2em]' : 'px-5 py-2.5 text-sm tracking-[0.24em]'}`}
      style={{ borderColor: 'rgba(255,217,15,0.24)', color: '#FFD90F' }}
    >
      Team Attention presented
    </div>
  )
}

export function SetupView({
  title,
  minutes,
  seconds,
  error,
  onTitleChange,
  onMinutesChange,
  onSecondsChange,
  onSubmit,
}: {
  readonly title: string
  readonly minutes: string
  readonly seconds: string
  readonly error: string
  readonly onTitleChange: (value: string) => void
  readonly onMinutesChange: (value: string) => void
  readonly onSecondsChange: (value: string) => void
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form onSubmit={onSubmit} className="relative z-20 grid w-full max-w-6xl gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-8">
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border p-5 glass-card lg:min-h-[540px] lg:gap-6 lg:p-6">
        <PresenterMark />
        <BrandStack />
        <p className="max-w-sm text-center font-mono text-sm leading-6" style={{ color: '#8892b0' }}>
          Toss sprint timer for hands-off Ralph runs.
        </p>
      </div>
      <div className="rounded-xl border p-5 shadow-2xl glass-card sm:p-8 lg:p-10">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.28em]" style={{ color: '#45B649' }}>
          Team Attention presented
        </p>
        <h1
          className="mt-4 font-display text-5xl leading-none tracking-wider sm:text-7xl lg:text-8xl"
          style={{ color: '#FFD90F', textShadow: '0 0 34px rgba(255,217,15,0.34)' }}
        >
          RALPHTHON TIMER
        </h1>
        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="timer-title" className="font-mono text-xs font-bold uppercase tracking-[0.24em]" style={{ color: '#8892b0' }}>
              Timer title
            </Label>
            <input
              id="timer-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="h-14 w-full min-w-0 rounded-lg border border-input bg-yellow/10 px-4 text-lg font-bold text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field id="timer-minutes" label="Minutes" value={minutes} min={0} onChange={onMinutesChange} />
            <Field id="timer-seconds" label="Seconds" value={seconds} min={0} max={59} onChange={onSecondsChange} />
          </div>
          {error && (
            <p className="rounded-lg border px-4 py-3 font-mono text-sm" style={{ color: '#E63946', borderColor: 'rgba(230,57,70,0.32)' }}>
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="h-14 w-full gap-3 rounded-lg font-display text-3xl tracking-wider transition hover:scale-[1.01] active:scale-[0.98] sm:h-16"
            style={{ background: '#E63946', color: '#fff', boxShadow: '0 0 34px rgba(230,57,70,0.38)' }}
          >
            <Play className="size-7" />
            RALPH, RUN IT
          </Button>
        </div>
      </div>
    </form>
  )
}

export function ActiveTimerView({
  state,
  remaining,
  onReset,
}: {
  readonly state: ActiveTimerState
  readonly remaining: number
  readonly onReset: () => void
}) {
  const finished = state.kind === 'finished'

  return (
    <section className="relative z-20 flex w-full max-w-6xl flex-col items-center justify-center gap-8 rounded-xl border px-5 py-8 text-center shadow-2xl glass-card sm:px-8 lg:min-h-[680px]">
      <PresenterMark compact />
      <BrandStack compact />
      <div>
        <p className="font-mono text-sm font-bold uppercase tracking-[0.28em]" style={{ color: finished ? '#E63946' : '#45B649' }}>
          {finished ? 'Time is up' : 'Hands off'}
        </p>
        <h1
          className="mt-4 max-w-5xl font-display text-6xl leading-none tracking-wider sm:text-7xl lg:text-8xl"
          style={{ color: finished ? '#E63946' : '#FFD90F', textShadow: '0 0 34px rgba(255,217,15,0.28)' }}
        >
          {state.title}
        </h1>
      </div>
      <div
        className="flex aspect-square w-[min(76vw,420px)] flex-col items-center justify-center rounded-full border"
        style={{
          background: finished ? 'rgba(230,57,70,0.16)' : 'rgba(255,217,15,0.09)',
          borderColor: finished ? 'rgba(230,57,70,0.52)' : 'rgba(255,217,15,0.28)',
          boxShadow: finished ? '0 0 90px rgba(230,57,70,0.24)' : '0 0 80px rgba(255,217,15,0.14)',
        }}
      >
        <span className="font-display text-7xl leading-none tracking-wider sm:text-8xl lg:text-9xl" style={{ color: finished ? '#E63946' : '#FFD90F' }}>
          {formatTime(remaining)}
        </span>
        <span className="mt-6 text-6xl" style={{ animation: finished ? 'lobsterPulse 1s ease-in-out infinite' : 'lobsterPulse 1.8s ease-in-out infinite' }}>
          {'\u{1F99E}'}
        </span>
      </div>
      <Button
        type="button"
        onClick={onReset}
        className="h-12 gap-2 rounded-lg px-5 font-display text-2xl tracking-wider"
        style={{ background: 'rgba(255,217,15,0.14)', color: '#FFD90F', border: '1px solid rgba(255,217,15,0.34)' }}
      >
        <RotateCcw className="size-5" />
        NEW TIMER
      </Button>
    </section>
  )
}
