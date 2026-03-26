'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { HackathonBg } from '@/components/hackathon-bg'

const ASCII_LOBSTER = `      ,     ,
     (\\____/)
      (_oo_)
        (O)
      __||__    \\)
   []/______\\[] /
   / \\______/ \\/
  /    /__\\
 (\\   /____\\`

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
          .eq('role', 'member')
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <HackathonBg />

      <div className="relative z-20 flex flex-col items-center gap-6 text-center">
        {/* ASCII Lobster */}
        <pre
          className="text-xs leading-tight sm:text-sm"
          style={{
            color: '#E63946',
            opacity: 0.5,
            animation: mounted ? 'fadeInUp 0.5s ease-out' : undefined,
            fontFamily: 'var(--font-jetbrains), monospace',
          }}
        >
          {ASCII_LOBSTER}
        </pre>

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
          <span style={{ color: '#FFD90F' }}>{'>'}</span> Collaborate.{' '}
          <span style={{ color: '#FFD90F' }}>{'>'}</span> Request lobsters.
        </p>

        {/* Ralph Quote */}
        <p
          className="font-display text-xl tracking-wide sm:text-2xl"
          style={{
            color: '#E63946',
            animation: mounted ? 'glitch 4s ease-in-out infinite, fadeInUp 1.1s ease-out' : undefined,
          }}
        >
          &quot;I&apos;m helping!&quot; — Ralph Wiggum
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
