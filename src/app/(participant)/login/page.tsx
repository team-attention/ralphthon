'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { HackathonBg } from '@/components/hackathon-bg'

type SponsorLogo = {
  src: string
  alt: string
  className: string
  mobileClassName?: string
  delay: string
  duration: string
  filter?: string
  position: string
}

const baseLogoFilter = 'brightness(0.8)'
const partnerLogoFilter = 'brightness(0) invert(1) opacity(0.82)'

const LEFT_SPONSORS: SponsorLogo[] = [
  { src: '/openai-1.png', alt: 'OpenAI', delay: '0s', duration: '5s', className: 'w-36 sm:w-44 lg:w-52', mobileClassName: 'w-28', position: 'left-4 top-[15%] lg:left-8 xl:left-16' },
  { src: '/partners/superteam-sg.svg', alt: 'Superteam SG', delay: '-0.8s', duration: '4.9s', className: 'w-28 lg:w-36', mobileClassName: 'w-24', filter: partnerLogoFilter, position: 'left-[10%] top-[31%] -rotate-3 lg:left-[8%] xl:left-[11%]' },
  { src: '/partners/petani.png', alt: 'Petani', delay: '-2.4s', duration: '5.2s', className: 'w-24 lg:w-32', mobileClassName: 'w-20', filter: partnerLogoFilter, position: 'left-5 top-[50%] rotate-2 lg:left-12 xl:left-24' },
  { src: '/partners/network-school.svg', alt: 'Network School', delay: '-3.8s', duration: '4.7s', className: 'w-32 lg:w-40', mobileClassName: 'w-28', filter: partnerLogoFilter, position: 'left-[12%] top-[66%] lg:left-[9%] xl:left-[12%]' },
  { src: '/partners/65labs.png', alt: '65labs', delay: '-4.4s', duration: '5.4s', className: 'w-20 lg:w-24', mobileClassName: 'w-16', filter: partnerLogoFilter, position: 'left-8 top-[80%] -rotate-2 lg:left-16 xl:left-28' },
]

const RIGHT_SPONSORS: SponsorLogo[] = [
  { src: '/hashed.svg', alt: 'Hashed', delay: '-1s', duration: '4.8s', className: 'w-28 lg:w-36', mobileClassName: 'w-24', position: 'right-6 top-[18%] lg:right-12 xl:right-20' },
  { src: '/partners/arize-ai.svg', alt: 'Arize AI', delay: '-1.2s', duration: '5.1s', className: 'w-28 lg:w-36', mobileClassName: 'w-24', filter: partnerLogoFilter, position: 'right-[12%] top-[34%] rotate-2 lg:right-[9%] xl:right-[12%]' },
  { src: '/partners/aer-labs.png', alt: 'AER Labs', delay: '-2.8s', duration: '4.6s', className: 'w-24 lg:w-32', mobileClassName: 'w-20', filter: partnerLogoFilter, position: 'right-5 top-[51%] -rotate-2 lg:right-12 xl:right-24' },
  { src: '/partners/ironclaw.png', alt: 'Ironclaw / nearAI', delay: '-4s', duration: '5.3s', className: 'w-24 lg:w-32', mobileClassName: 'w-20', filter: partnerLogoFilter, position: 'right-[11%] top-[67%] lg:right-[8%] xl:right-[11%]' },
  { src: '/partners/iyuno.png', alt: 'Iyuno', delay: '-0.4s', duration: '4.8s', className: 'w-24 lg:w-32', mobileClassName: 'w-20', filter: partnerLogoFilter, position: 'right-8 top-[81%] rotate-3 lg:right-16 xl:right-28' },
]

const MOBILE_SPONSORS = [...LEFT_SPONSORS, ...RIGHT_SPONSORS]
const DESKTOP_SPONSORS = [...LEFT_SPONSORS, ...RIGHT_SPONSORS]

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
        {DESKTOP_SPONSORS.map((s) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            className={`absolute h-auto object-contain opacity-60 transition-opacity duration-300 hover:opacity-95 ${s.className} ${s.position}`}
            style={{
              animation: mounted ? `float ${s.duration} ease-in-out ${s.delay} infinite, fadeInUp 0.5s ease-out` : undefined,
              filter: s.filter ?? baseLogoFilter,
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
          {MOBILE_SPONSORS.map((s) => (
            <img
              key={s.src}
              src={s.src}
              alt={s.alt}
              className={`h-auto object-contain opacity-60 ${s.mobileClassName ?? 'w-24'}`}
              style={{ filter: s.filter ?? baseLogoFilter }}
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
          <span style={{ color: '#FFD90F' }}>{'>'}</span> Register your team.{' '}
          <span style={{ color: '#FFD90F' }}>{'>'}</span> Build with AI.{' '}
          <span style={{ color: '#FFD90F' }}>{'>'}</span> Happy Ralphing!
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
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
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
