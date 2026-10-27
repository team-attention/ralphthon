'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { HackathonBg } from '@/components/hackathon-bg'
import { GoogleIcon } from '@/components/google-icon'

type SponsorLogo = {
  src: string
  alt: string
  className: string
  mobileClassName?: string
  delay: string
  duration: string
  position: string
}

const baseLogoFilter = 'brightness(0.8)'

const LEFT_SPONSORS: SponsorLogo[] = [
  { src: '/openai-1.png', alt: 'OpenAI', delay: '0s', duration: '5s', className: 'w-[7.2rem] sm:w-[8.8rem] lg:w-[10.4rem]', mobileClassName: 'w-[5.6rem]', position: 'left-4 top-[15%] lg:left-8 xl:left-16' },
]

const RIGHT_SPONSORS: SponsorLogo[] = [
  { src: '/ralphthon.png', alt: 'Ralphthon', delay: '-1s', duration: '4.8s', className: 'w-28 lg:w-36', mobileClassName: 'w-24', position: 'right-6 top-[18%] lg:right-12 xl:right-20' },
]

const SPONSORS = [...LEFT_SPONSORS, ...RIGHT_SPONSORS]

export default function LoginPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        // 1) Check if user is a team leader
        const { data: leaderTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('leader_user_id', user.id)
          .single()

        if (leaderTeam) {
          const teamData = leaderTeam as { id: string }
          router.replace(`/team/${teamData.id}`)
          return
        }

        // 2) Check if user is a team member (by email)
        const { data: memberRow } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('email', user.email!)
          .limit(1)
          .single()

        if (memberRow) {
          // Link user_id to team_members row for future lookups + RLS
          await supabase
            .from('team_members')
            .update({ user_id: user.id } as never)
            .eq('email', user.email!)
            .is('user_id', null)

          const member = memberRow as { team_id: string }
          router.replace(`/team/${member.team_id}`)
          return
        }

        // 3) Not in any team — go to register
        router.replace('/register')
      }
    })
  }, [router, supabase])

  async function handleGoogleLogin() {
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-0">
      <HackathonBg />

      <div className="pointer-events-none fixed inset-0 z-10 hidden overflow-hidden sm:block">
        {SPONSORS.map((s) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            className={`absolute h-auto object-contain opacity-60 transition-opacity duration-300 hover:opacity-95 ${s.className} ${s.position}`}
            style={{
              animation: mounted ? `float ${s.duration} ease-in-out ${s.delay} infinite, fadeInUp 0.5s ease-out` : undefined,
              filter: baseLogoFilter,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 flex flex-col items-center gap-3 text-center">
        {/* Ralph + Sponsors */}
        <div className="relative flex items-center justify-center">
          {/* Ralph */}
          <img
            src="/ralphthon.png"
            alt="Ralphthon"
            className="-mb-4 h-56 w-56 sm:-mb-6 sm:h-72 sm:w-72"
            style={{
              animation: mounted ? 'float 4s ease-in-out infinite, fadeInUp 0.5s ease-out' : undefined,
            }}
          />
        </div>

        {/* Mobile sponsors (horizontal scroll) */}
        <div className="flex sm:hidden flex-wrap items-center justify-center gap-4 -mt-2">
          {SPONSORS.map((s) => (
            <img
              key={s.src}
              src={s.src}
              alt={s.alt}
              className={`h-auto object-contain opacity-60 ${s.mobileClassName ?? 'w-24'}`}
              style={{ filter: baseLogoFilter }}
            />
          ))}
        </div>

        {/* Title */}
        <h1
          className="font-display text-7xl tracking-wider sm:text-8xl lg:text-9xl"
          style={{
            color: '#FFD90F',
            animation: mounted ? 'yellowGlow 3s ease-in-out infinite, fadeInUp 0.7s ease-out' : undefined,
            letterSpacing: '0.08em',
          }}
        >
          RALPHTHON
        </h1>

        {/* Subtitle */}
        <p
          className="max-w-lg text-base tracking-wide sm:text-lg"
          style={{
            color: '#8892b0',
            animation: mounted ? 'fadeInUp 0.9s ease-out' : undefined,
          }}
        >
          <span style={{ color: '#FFD90F' }}>{'>'}</span> Busan Codex Community.{' '}
          <span style={{ color: '#FFD90F' }}>{'>'}</span> Build with Codex Goal.{' '}
          <span style={{ color: '#FFD90F' }}>{'>'}</span> May 30, 1-7 PM.
        </p>

        {/* Login Card */}
        <div
          className="mt-4 w-full max-w-sm glass-card rounded-xl p-6"
          style={{
            animation: mounted ? 'fadeInUp 1.3s ease-out' : undefined,
          }}
        >
          <button
            onClick={handleGoogleLogin}
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg px-6 py-3 font-display text-xl tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: '#FFD90F',
              color: '#0a0a1a',
            }}
          >
            <GoogleIcon />
            {t('signInWithGoogle')}
          </button>

          <p className="mt-4 text-center text-sm" style={{ color: '#8892b0' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Terminal footer */}
        <div
          className="mt-6 flex items-center gap-2 text-sm"
          style={{
            color: '#8892b0',
            animation: mounted ? 'fadeInUp 1.5s ease-out' : undefined,
          }}
        >
          <span style={{ color: '#45B649' }}>{'$'}</span>
          <span>ralphthon --status</span>
          <span style={{ color: '#FFD90F' }}>ready</span>
          <span
            className="ml-1 inline-block h-4 w-2"
            style={{
              background: '#FFD90F',
              animation: 'blink 1s step-end infinite',
            }}
          />
        </div>

      </div>
    </div>
  )
}
