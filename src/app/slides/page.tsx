'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { HackathonBg } from '@/components/hackathon-bg'
import { LobsterEffect } from '@/components/lobster-effect'

const TIMER_SECONDS = 5 * 60

type Slide = {
  id: string
  eyebrow: string
  title: string
  accent?: 'yellow' | 'red' | 'green'
  body?: string
  bullets?: string[]
  kind?: 'welcome' | 'title' | 'video' | 'flow' | 'timer' | 'warning' | 'transition'
}

const flowSteps = ['Spec', 'Goal Test', 'Ralph', 'Hands-on', 'Demo', 'Awards']

const slides: Slide[] = [
  {
    id: 'welcome',
    eyebrow: 'WELCOME',
    title: 'Welcome',
    body: 'Codex Meetup Busan',
    kind: 'welcome',
    accent: 'green',
  },
  {
    id: 'checkin',
    eyebrow: 'CHECK-IN',
    title: '체크인 시작',
    body: '이름 확인 · 팀 찾기 · Discord 확인',
    bullets: ['자리에 앉으면 Wi-Fi와 Discord부터 확인', '팀이 없으면 운영진에게 바로 알려주세요'],
    kind: 'transition',
  },
  {
    id: 'opening',
    eyebrow: 'BUSAN EVENT OPENING',
    title: 'Ralphthon',
    body: 'Build with Codex Goal',
    bullets: ['반나절 안에 작동하는 결과물', '오늘은 설명보다 실행', '마지막에는 live demo'],
    kind: 'title',
  },
  {
    id: 'intro',
    eyebrow: 'WHAT IS RALPHTHON',
    title: 'Seoul · SF · Singapore',
    body: 'Ralphthon은 에이전트가 실제로 만드는 시간을 행사 포맷으로 만든 실험입니다.',
    kind: 'video',
  },
  {
    id: 'goal',
    eyebrow: 'TODAY',
    title: '작동하는 걸 만든다',
    bullets: ['반나절 안에 보여줄 수 있는 결과물', '완성된 설명보다 실제 화면', '데모가 되면 이긴다'],
    kind: 'title',
  },
  {
    id: 'schedule',
    eyebrow: 'TODAY SCHEDULE',
    title: '오늘 진행 순서',
    bullets: [
      '13:00 체크인 · 아이스브레이킹 · 오프닝',
      '13:40 Codex Goal 퀵 데모 · 팀/트랙 확정',
      '14:15 빌딩 스프린트 시작',
      '17:00 캐주얼 데모',
      '17:45 시상 · 랩업',
      '18:20 공간 정리 · 최종 퇴실',
    ],
    kind: 'transition',
  },
  {
    id: 'team-lock',
    eyebrow: 'TEAM LOCK',
    title: '팀/트랙 확정',
    body: '지금부터는 한 팀, 한 트랙으로 갑니다.',
    bullets: ['팀당 최대 4명', '트랙은 제출 때 바꾸지 않기', '애매하면 운영진에게 지금 물어보기'],
    kind: 'transition',
  },
  {
    id: 'sprint',
    eyebrow: 'BUILD SPRINT',
    title: '빌딩 스프린트 시작',
    body: '작게 만들고 바로 실행해보세요.',
    bullets: ['큰 아이디어보다 작은 작동 path', '처음 20분 안에 repo와 실행 명령 확보', '막히면 scope를 줄입니다'],
    kind: 'transition',
  },
  {
    id: 'flow',
    eyebrow: 'FORMAT',
    title: '운영 방식',
    body: 'Spec을 작게 고정하고, Goal을 테스트한 뒤, Ralph에게 실행을 맡깁니다.',
    kind: 'flow',
  },
  {
    id: 'spec',
    eyebrow: 'STEP 1',
    title: 'Spec 작성',
    bullets: ['무엇을 만들지 한 문장으로 적기', '성공 조건을 눈으로 확인 가능하게 만들기', '마지막 demo path를 먼저 정하기'],
    kind: 'transition',
  },
  {
    id: 'goal-test',
    eyebrow: 'STEP 2',
    title: 'Goal 테스트',
    bullets: ['Codex /goal 이 실행할 수 있는 형태인지 확인', '애매한 요구사항을 줄이고 파일/명령을 명시', '첫 loop가 시작될 만큼만 충분하면 됩니다'],
    kind: 'transition',
  },
  {
    id: 'lobster-rule',
    eyebrow: 'RULE',
    title: '손대면 랍스터',
    body: 'Ralph가 도는 동안 랩탑을 직접 만지면 랍스터 코스튬을 입어야 합니다.',
    bullets: ['질문은 가능', '관찰은 가능', '직접 수정은 랍스터'],
    kind: 'warning',
    accent: 'red',
  },
  {
    id: 'ralph',
    eyebrow: 'STEP 3',
    title: 'Ralph 실행',
    body: '타이머가 시작되면 손을 떼세요.',
    kind: 'timer',
    accent: 'red',
  },
  {
    id: 'human-time',
    eyebrow: 'LAST HOUR',
    title: '마지막 1시간',
    bullets: ['이제 사람이 직접 고칩니다', '제출 링크와 데모 흐름을 정리합니다', '망가진 부분보다 작동하는 path를 살립니다'],
    kind: 'transition',
  },
  {
    id: 'demo-start',
    eyebrow: 'DEMO START',
    title: '데모 시작',
    body: '슬라이드보다 실제 작동 화면',
    bullets: ['팀당 짧게', '가장 잘 되는 path만 보여주기', '실패해도 무엇을 만들었는지 명확히 말하기'],
    kind: 'transition',
  },
  {
    id: 'demo',
    eyebrow: 'DEMO',
    title: '실제 작동 화면',
    bullets: ['팀당 짧게', '슬라이드보다 live demo', '행사 시간 안에 만든 부분을 보여주세요'],
    kind: 'transition',
  },
  {
    id: 'judging',
    eyebrow: 'JUDGING',
    title: 'Live Demo · Creativity · Impact',
    bullets: ['작동하는가', '새로운 접근인가', '행사 이후에도 살아남을 수 있는가'],
    kind: 'transition',
  },
  {
    id: 'awards',
    eyebrow: 'AWARDS',
    title: '시상 시작',
    body: 'Live demo · Creativity · Impact',
    bullets: ['트랙별 핵심 약속을 얼마나 지켰는지 봅니다', '짧게 축하하고 바로 네트워킹으로 이어갑니다'],
    kind: 'transition',
  },
  {
    id: 'wrap',
    eyebrow: 'WRAP',
    title: '공간 정리',
    body: '최종 퇴실 전 자리와 장비를 정리해주세요.',
    bullets: ['쓰레기 정리', '대여 장비 확인', '사진과 링크는 Discord에 공유'],
    kind: 'transition',
  },
]

function clampSlide(index: number) {
  return Math.max(0, Math.min(slides.length - 1, index))
}

function findInitialSlide() {
  if (typeof window === 'undefined') return 0

  const fromQuery = new URLSearchParams(window.location.search).get('slide')
  const target = fromQuery || window.location.hash.replace(/^#/, '')
  const index = slides.findIndex((slide) => slide.id === target)

  return index >= 0 ? index : 0
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

function SlideShell({
  children,
  slide,
}: {
  children: React.ReactNode
  slide: Slide
}) {
  const accentColor = slide.accent === 'red' ? '#E63946' : slide.accent === 'green' ? '#45B649' : '#FFD90F'

  return (
    <section
      className="relative z-20 flex aspect-video w-full max-w-7xl flex-col justify-between overflow-hidden rounded-xl border p-10 shadow-2xl sm:p-12 lg:p-14"
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.88) 0%, rgba(10,10,26,0.76) 100%)',
        borderColor: 'rgba(255, 217, 15, 0.14)',
        boxShadow: `0 0 60px ${slide.accent === 'red' ? 'rgba(230,57,70,0.12)' : 'rgba(255,217,15,0.1)'}`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50 grid-bg" />
      <div className="relative flex items-center justify-between gap-4">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.28em]" style={{ color: accentColor }}>
          {slide.eyebrow}
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: '#8892b0' }}>
          Ralphthon Busan
        </p>
      </div>
      <div className="relative flex flex-1 items-center">{children}</div>
    </section>
  )
}

function WelcomeSlide({ slide }: { slide: Slide }) {
  return (
    <section
      className="relative z-20 flex aspect-video w-full max-w-7xl flex-col items-center justify-center overflow-hidden rounded-xl border p-10 shadow-2xl"
      style={{
        background: 'radial-gradient(circle at 50% 36%, rgba(106,118,255,0.46) 0%, rgba(44,74,194,0.28) 32%, rgba(10,10,26,0.96) 78%)',
        borderColor: 'rgba(174, 212, 255, 0.22)',
        boxShadow: '0 0 90px rgba(76, 101, 255, 0.18)',
      }}
    >
      <div className="absolute inset-0 opacity-35 grid-bg" />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,26,0.08) 0%, rgba(10,10,26,0.36) 100%)',
        }}
      />
      <div className="relative flex w-full flex-col items-center justify-center gap-8">
        <div
          className="h-[min(46vh,430px)] w-[min(46vh,430px)] rounded-[28px] border bg-cover bg-center shadow-2xl"
          style={{
            backgroundImage: 'url(/codex-meetup-busan.avif)',
            borderColor: 'rgba(255,255,255,0.2)',
            boxShadow: '0 28px 90px rgba(17, 36, 140, 0.42), 0 0 80px rgba(130, 164, 255, 0.18)',
          }}
          aria-label="Codex Community Meetup Busan"
          role="img"
        />
        <div className="text-center">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.28em]" style={{ color: '#C8D8FF' }}>
            {slide.body}
          </p>
          <h1
            className="mt-4 font-display text-8xl leading-none tracking-wider sm:text-9xl lg:text-[10.5rem]"
            style={{ color: '#ffffff', textShadow: '0 0 34px rgba(255,255,255,0.32), 0 0 90px rgba(82,112,255,0.42)' }}
          >
            {slide.title}
          </h1>
        </div>
      </div>
    </section>
  )
}

function BasicSlide({ slide }: { slide: Slide }) {
  const isWarning = slide.kind === 'warning'

  return (
    <div className="w-full">
      <h1
        className={`font-display leading-none tracking-wider ${isWarning ? 'text-7xl sm:text-8xl lg:text-[8.5rem]' : 'text-7xl sm:text-8xl lg:text-[9.5rem]'}`}
        style={{
          color: isWarning ? '#E63946' : '#FFD90F',
          textShadow: isWarning
            ? '0 0 30px rgba(230,57,70,0.6), 0 0 70px rgba(230,57,70,0.25)'
            : '0 0 30px rgba(255,217,15,0.45), 0 0 70px rgba(255,217,15,0.18)',
        }}
      >
        {slide.title}
      </h1>
      {slide.body && (
        <p className="mt-7 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl" style={{ color: '#e2e8f0' }}>
          {slide.body}
        </p>
      )}
      {slide.bullets && (
        <div className="mt-10 grid gap-4 text-2xl font-bold leading-tight sm:text-3xl">
          {slide.bullets.map((bullet) => (
            <p key={bullet} className="glass-card rounded-lg px-5 py-4" style={{ color: '#e2e8f0' }}>
              <span className="mr-3" style={{ color: '#45B649' }}>{'$'}</span>
              {bullet}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function VideoSlide({ slide }: { slide: Slide }) {
  return (
    <div className="grid w-full grid-cols-[0.9fr_1.25fr] items-center gap-10">
      <div>
        <h1
          className="font-display text-7xl leading-none tracking-wider lg:text-8xl"
          style={{ color: '#FFD90F', textShadow: '0 0 30px rgba(255,217,15,0.4)' }}
        >
          {slide.title}
        </h1>
        <p className="mt-7 text-3xl font-bold leading-tight" style={{ color: '#e2e8f0' }}>
          {slide.body}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {['Seoul', 'SF', 'Singapore'].map((city) => (
            <span
              key={city}
              className="rounded-full px-5 py-2 font-display text-2xl tracking-wider"
              style={{
                color: city === 'SF' ? '#45B649' : '#FFD90F',
                border: '1px solid rgba(255,217,15,0.24)',
                background: 'rgba(255,217,15,0.08)',
              }}
            >
              {city}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(255,217,15,0.18)' }}>
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/Y7qXj6O_5Jk"
            title="Ralphthon 대표 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <a
          href="https://youtu.be/Y7qXj6O_5Jk"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-sm underline underline-offset-4"
          style={{ color: '#64ffda' }}
        >
          youtube.com/watch?v=Y7qXj6O_5Jk
        </a>
      </div>
    </div>
  )
}

function FlowSlide({ slide }: { slide: Slide }) {
  return (
    <div className="w-full">
      <h1 className="font-display text-8xl leading-none tracking-wider" style={{ color: '#FFD90F' }}>
        {slide.title}
      </h1>
      <p className="mt-6 max-w-5xl text-3xl font-bold leading-tight" style={{ color: '#e2e8f0' }}>
        {slide.body}
      </p>
      <div className="mt-12 grid grid-cols-6 gap-3">
        {flowSteps.map((step, index) => (
          <div
            key={step}
            className="flex min-h-44 flex-col justify-between rounded-lg border px-4 py-5"
            style={{
              background: index === 2 ? 'rgba(230,57,70,0.16)' : 'rgba(255,217,15,0.08)',
              borderColor: index === 2 ? 'rgba(230,57,70,0.45)' : 'rgba(255,217,15,0.2)',
            }}
          >
            <span className="font-mono text-sm font-bold" style={{ color: '#8892b0' }}>
              0{index + 1}
            </span>
            <span
              className="font-display text-4xl leading-none tracking-wider"
              style={{ color: index === 2 ? '#E63946' : '#FFD90F' }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimerSlide({
  slide,
  remaining,
  running,
  finished,
  onStart,
  onReset,
}: {
  slide: Slide
  remaining: number
  running: boolean
  finished: boolean
  onStart: () => void
  onReset: () => void
}) {

  return (
    <div className="w-full">
      <div className="grid grid-cols-[1fr_0.8fr] items-center gap-10">
        <div>
          <h1
            className="font-display text-8xl leading-none tracking-wider lg:text-[9rem]"
            style={{ color: '#E63946', textShadow: '0 0 36px rgba(230,57,70,0.55)' }}
          >
            {slide.title}
          </h1>
          <p className="mt-6 text-4xl font-bold leading-tight" style={{ color: '#e2e8f0' }}>
            {running || finished ? '이제부터 손대면 랍스터 코스튬' : slide.body}
          </p>
          <div className="mt-10 flex gap-4">
            {!running && !finished ? (
              <button
                type="button"
                onClick={onStart}
                className="rounded-lg px-8 py-4 font-display text-4xl tracking-wider transition hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: '#E63946', color: '#fff', boxShadow: '0 0 30px rgba(230,57,70,0.4)' }}
              >
                START 5:00
              </button>
            ) : (
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg px-8 py-4 font-display text-4xl tracking-wider transition hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: 'rgba(255,217,15,0.14)', color: '#FFD90F', border: '1px solid rgba(255,217,15,0.32)' }}
              >
                {finished ? 'RESET TIMER' : 'RESET'}
              </button>
            )}
          </div>
        </div>
        <div
          className="flex aspect-square flex-col items-center justify-center rounded-full border"
          style={{
            background: running ? 'rgba(230,57,70,0.14)' : 'rgba(255,217,15,0.08)',
            borderColor: running ? 'rgba(230,57,70,0.5)' : 'rgba(255,217,15,0.24)',
            boxShadow: running ? '0 0 70px rgba(230,57,70,0.18)' : '0 0 60px rgba(255,217,15,0.1)',
          }}
        >
          <span className="font-mono text-base font-bold uppercase tracking-[0.25em]" style={{ color: '#8892b0' }}>
            {finished ? 'time is up' : running ? 'hands off' : 'ready'}
          </span>
          <span
            className="mt-4 font-display text-8xl leading-none tracking-wider lg:text-[8rem]"
            style={{ color: running || finished ? '#E63946' : '#FFD90F' }}
          >
            {formatTime(remaining)}
          </span>
          <span className="mt-6 text-6xl" style={{ animation: running ? 'lobsterPulse 1.5s ease-in-out infinite' : undefined }}>
            {'\u{1F99E}'}
          </span>
        </div>
      </div>
    </div>
  )
}

function SlideContent({
  slide,
  timer,
}: {
  slide: Slide
  timer: {
    remaining: number
    running: boolean
    finished: boolean
    onStart: () => void
    onReset: () => void
  }
}) {
  if (slide.kind === 'welcome') return <WelcomeSlide slide={slide} />
  if (slide.kind === 'video') return <VideoSlide slide={slide} />
  if (slide.kind === 'flow') return <FlowSlide slide={slide} />
  if (slide.kind === 'timer') return <TimerSlide slide={slide} {...timer} />

  return <BasicSlide slide={slide} />
}

export default function SlidesPage() {
  const [current, setCurrent] = useState(0)
  const [deadline, setDeadline] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(TIMER_SECONDS)
  const [timerFinished, setTimerFinished] = useState(false)
  const [showLobster, setShowLobster] = useState(false)

  const timerRunning = deadline !== null && !timerFinished

  useEffect(() => {
    setCurrent(findInitialSlide()) // eslint-disable-line react-hooks/set-state-in-effect
    const onHashChange = () => setCurrent(findInitialSlide())

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const startTimer = useCallback(() => {
    setRemaining(TIMER_SECONDS)
    setTimerFinished(false)
    setShowLobster(false)
    setDeadline(Date.now() + TIMER_SECONDS * 1000)
  }, [])

  const resetTimer = useCallback(() => {
    setDeadline(null)
    setRemaining(TIMER_SECONDS)
    setTimerFinished(false)
    setShowLobster(false)
  }, [])

  useEffect(() => {
    if (!deadline) return

    const tick = () => {
      const nextRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(nextRemaining)
      if (nextRemaining === 0) {
        setDeadline(null)
        setTimerFinished(true)
        setShowLobster(true)
      }
    }

    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [deadline])

  const goTo = useCallback((index: number) => {
    const next = clampSlide(index)
    setCurrent(next)
    window.history.replaceState(null, '', `#${slides[next].id}`)
  }, [])

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName
      const isControl = tagName === 'BUTTON' || tagName === 'A' || tagName === 'IFRAME'

      if (event.key === 'ArrowRight' || event.key === 'PageDown' || (event.key === ' ' && !isControl)) {
        event.preventDefault()
        goNext()
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        goPrev()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev])

  const slide = slides[current]
  const progress = useMemo(() => ((current + 1) / slides.length) * 100, [current])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-6">
      <HackathonBg showQuotes={false} />
      <LobsterEffect active={showLobster} onDismiss={() => setShowLobster(false)} />
      {slide.kind === 'welcome' ? (
        <WelcomeSlide slide={slide} />
      ) : (
        <SlideShell slide={slide}>
          <SlideContent
            slide={slide}
            timer={{
              remaining,
              running: timerRunning,
              finished: timerFinished,
              onStart: startTimer,
              onReset: resetTimer,
            }}
          />
        </SlideShell>
      )}
      <div className="fixed bottom-5 left-1/2 z-30 flex w-[min(760px,calc(100vw-40px))] -translate-x-1/2 items-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-md px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide transition disabled:opacity-30"
          style={{ color: '#8892b0', border: '1px solid rgba(255,217,15,0.16)', background: 'rgba(10,10,26,0.68)' }}
          disabled={current === 0}
        >
          Prev
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,217,15,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FFD90F, #45B649)' }}
          />
        </div>
        <p className="w-20 text-center font-mono text-xs font-bold" style={{ color: '#8892b0' }}>
          {current + 1}/{slides.length}
        </p>
        <button
          type="button"
          onClick={goNext}
          className="rounded-md px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide transition disabled:opacity-30"
          style={{ color: '#8892b0', border: '1px solid rgba(255,217,15,0.16)', background: 'rgba(10,10,26,0.68)' }}
          disabled={current === slides.length - 1}
        >
          Next
        </button>
      </div>
    </main>
  )
}
