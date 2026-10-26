import type { ReactNode } from 'react'
import Image from 'next/image'
import { ruleItems, slideIds, teamMembers, timetableItems, toolLogos } from './slide-data'

function SlideFrame({ eyebrow, children }: { readonly eyebrow: string; readonly children: ReactNode }) {
  return (
    <section
      className="relative z-20 flex h-[min(720px,calc(100dvh-7.5rem))] w-full max-w-7xl flex-col overflow-hidden rounded-xl border p-6 shadow-2xl sm:aspect-video sm:h-auto sm:p-10 lg:p-14"
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(10,10,26,0.8) 100%)',
        borderColor: 'rgba(255, 217, 15, 0.16)',
        boxShadow: '0 0 76px rgba(255,217,15,0.1), 0 0 120px rgba(230,57,70,0.08)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-45 grid-bg" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(69,182,73,0.13), transparent 36%), radial-gradient(circle at 78% 72%, rgba(230,57,70,0.14), transparent 33%)' }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.24em] sm:text-sm sm:tracking-[0.28em]" style={{ color: '#45B649' }}>
          {eyebrow}
        </p>
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.24em]" style={{ color: '#8892b0' }}>
          Team Attention presented
        </p>
      </div>
      <div className="relative flex flex-1 items-center">{children}</div>
    </section>
  )
}

function FloatingLogos() {
  return (
    <>
      {toolLogos.map((logo, index) => (
        <div
          key={logo.src}
          className={`absolute hidden rounded-xl px-3 py-2 shadow-2xl sm:block ${logo.alt === 'Ralph' ? 'border-transparent bg-transparent' : 'border bg-white/95'} ${logo.className}`}
          style={{
            borderColor: logo.side === 'left' ? 'rgba(45, 126, 255, 0.2)' : 'rgba(255, 217, 15, 0.18)',
            animation: `float ${4.2 + index * 0.42}s ease-in-out ${index * -0.55}s infinite`,
          }}
        >
          <Image src={logo.src} alt={logo.alt} width={180} height={90} className="h-auto w-full object-contain" />
        </div>
      ))}
    </>
  )
}

function WelcomeSlide() {
  return (
    <section
      className="relative z-20 flex h-[min(720px,calc(100dvh-7.5rem))] w-full max-w-7xl items-center justify-center overflow-hidden rounded-xl border p-6 shadow-2xl sm:aspect-video sm:h-auto sm:p-10 lg:p-14"
      style={{
        background: 'radial-gradient(circle at 50% 36%, rgba(106,118,255,0.42) 0%, rgba(44,74,194,0.25) 32%, rgba(10,10,26,0.96) 78%)',
        borderColor: 'rgba(174, 212, 255, 0.22)',
        boxShadow: '0 0 90px rgba(76, 101, 255, 0.18)',
      }}
    >
      <div className="absolute inset-0 opacity-35 grid-bg" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,26,0.04) 0%, rgba(10,10,26,0.42) 100%)' }} />
      <FloatingLogos />
      <div className="relative flex w-full flex-col items-center justify-center gap-5 text-center sm:gap-7">
        <div className="inline-flex rounded-xl bg-white/95 px-4 py-3 shadow-2xl shadow-blue-500/10 sm:px-6">
          <Image src="/toss-logo-primary.png" alt="Toss" width={280} height={140} priority className="h-auto w-36 sm:w-52 lg:w-64" />
        </div>
        <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] sm:text-sm sm:tracking-[0.28em]" style={{ color: '#C8D8FF' }}>
          {'> Toss AI Surf > Team Attention'}
        </p>
        <h1
          className="font-display text-5xl leading-none tracking-wider sm:text-8xl lg:text-[9.5rem]"
          style={{ color: '#ffffff', textShadow: '0 0 34px rgba(255,255,255,0.3), 0 0 90px rgba(82,112,255,0.42)' }}
        >
          Welcome to Ralphthon
        </h1>
        <div className="inline-flex items-center rounded-full border bg-yellow/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] sm:px-5 sm:text-sm sm:tracking-[0.24em]" style={{ borderColor: 'rgba(255,217,15,0.24)', color: '#FFD90F' }}>
          Goal &gt; 2년 6월 19일
        </div>
      </div>
    </section>
  )
}

function TimetableSlide() {
  return (
    <SlideFrame eyebrow="Timetable">
      <div className="grid w-full gap-3 lg:grid-cols-[0.48fr_1fr] lg:items-center lg:gap-10">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em]" style={{ color: '#8892b0' }}>
            Toss AI Surf
          </p>
          <h1 className="mt-3 font-display text-4xl leading-none tracking-wider sm:text-7xl lg:text-8xl" style={{ color: '#FFD90F' }}>
            Timetable
          </h1>
          <p className="mt-4 hidden max-w-md text-base font-bold leading-7 sm:block sm:text-xl" style={{ color: '#e2e8f0' }}>
            랄프가 만드는 동안 사람은 전략을 정리하고, 결과가 나오면 바로 데모로 연결합니다.
          </p>
        </div>
        <div className="grid gap-2 sm:gap-3">
          {timetableItems.map((item) => (
            <div key={item.time} className="grid gap-1.5 rounded-lg border bg-white/[0.04] px-3 py-2 sm:grid-cols-[9.3rem_1fr] sm:px-4 sm:py-3 lg:grid-cols-[10.5rem_1fr]" style={{ borderColor: `${item.accent}55` }}>
              <p className="font-display text-2xl leading-none tracking-wider sm:text-3xl" style={{ color: item.accent }}>
                {item.time}
              </p>
              <div>
                <p className="text-sm font-black leading-tight sm:text-xl" style={{ color: '#ffffff' }}>
                  {item.title}
                </p>
                {item.note && <p className="mt-1 text-xs font-bold leading-4 sm:text-base sm:leading-5" style={{ color: '#C8D8FF' }}>{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

function TeamSlide() {
  const [host, ...members] = teamMembers

  return (
    <SlideFrame eyebrow="Who We Are">
      <div className="grid w-full gap-2 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-7">
        <div>
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.24em]" style={{ color: '#8892b0' }}>
            Toss AI Surf
          </p>
          <h1 className="mt-3 font-display text-4xl leading-none tracking-wider sm:text-7xl lg:text-8xl" style={{ color: '#FFD90F' }}>
            Team Attention
          </h1>
          <article className="mt-3 rounded-lg border bg-yellow/10 p-3 lg:mt-4 lg:p-5" style={{ borderColor: `${host.accent}66`, boxShadow: `0 0 36px ${host.accent}22` }}>
            <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]" style={{ color: '#8892b0' }}>
              {host.role}
            </p>
            <h2 className="mt-1 font-display text-3xl leading-none tracking-wider sm:text-4xl lg:mt-2 lg:text-5xl" style={{ color: host.accent }}>
              {host.name}
            </h2>
            <p className="mt-1 break-all font-mono text-[0.58rem] font-bold leading-3 sm:text-[0.66rem]" style={{ color: '#C8D8FF', overflowWrap: 'anywhere' }}>
              {host.link}
            </p>
            <p className="mt-2 text-xs font-bold leading-4 sm:text-base sm:leading-6" style={{ color: '#e2e8f0' }}>
              {host.body}
            </p>
            <p className="mt-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.13em] sm:text-[0.62rem] sm:tracking-[0.16em]" style={{ color: '#C8D8FF' }}>
              {host.keywords.join(' · ')}
            </p>
          </article>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          {members.map((member) => (
            <article key={member.name} className="rounded-lg border bg-white/[0.04] p-2.5 lg:min-h-48 lg:p-4" style={{ borderColor: `${member.accent}55` }}>
              <p className="font-mono text-[0.48rem] font-bold uppercase tracking-[0.14em] sm:text-[0.58rem] sm:tracking-[0.18em]" style={{ color: '#8892b0' }}>
                {member.role}
              </p>
              <h2 className="mt-1 font-display text-xl leading-none tracking-wider sm:text-3xl" style={{ color: member.accent }}>
                {member.name}
              </h2>
              <p className="mt-1 hidden break-all font-mono text-[0.54rem] font-bold leading-3 sm:block" style={{ color: '#C8D8FF', overflowWrap: 'anywhere' }}>
                {member.link}
              </p>
              <p className="mt-1.5 line-clamp-4 text-[0.65rem] font-bold leading-3 sm:mt-2 sm:text-sm sm:leading-5 lg:line-clamp-none" style={{ color: '#e2e8f0' }}>
                {member.body}
              </p>
              <p className="mt-2 hidden font-mono text-[0.56rem] font-bold uppercase leading-3 tracking-[0.13em] sm:block" style={{ color: '#8892b0' }}>
                {member.keywords.join(' · ')}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

function RuleSlide() {
  return (
    <SlideFrame eyebrow="Rule">
      <div className="w-full">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.24em]" style={{ color: '#8892b0' }}>
              Ralph hands-off protocol
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none tracking-wider sm:text-7xl lg:text-8xl" style={{ color: '#E63946' }}>
              Rule
            </h1>
          </div>
          <Image src="/ralphthon.png" alt="Ralph" width={150} height={150} className="hidden h-auto w-24 sm:block lg:w-32" />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {ruleItems.map((rule) => (
            <article key={rule.label} className="flex min-h-32 flex-col rounded-lg border bg-white/[0.04] p-4 sm:min-h-40 sm:p-5 lg:min-h-72 lg:p-6" style={{ borderColor: `${rule.accent}66`, boxShadow: `0 0 36px ${rule.accent}22` }}>
              <p className="font-mono text-xs font-bold tracking-[0.24em]" style={{ color: '#8892b0' }}>
                {rule.label}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-none tracking-wider sm:text-4xl lg:text-5xl" style={{ color: rule.accent }}>
                {rule.title}
              </h2>
              <p className="mt-3 text-sm font-bold leading-6 sm:text-lg sm:leading-7" style={{ color: '#e2e8f0' }}>
                {rule.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}

export function CurrentSlide({ index }: { readonly index: number }) {
  if (slideIds[index] === 'team') return <TeamSlide />
  if (slideIds[index] === 'timetable') return <TimetableSlide />
  if (slideIds[index] === 'rule') return <RuleSlide />
  return <WelcomeSlide />
}
