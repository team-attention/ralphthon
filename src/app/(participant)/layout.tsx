'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { LocaleSwitcher } from '@/components/locale-switcher'

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('common')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [teamId, setTeamId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: team } = await supabase
          .from('teams')
          .select('id')
          .eq('leader_user_id', user.id)
          .single()

        if (team) {
          const teamData = team as { id: string }
          setTeamId(teamData.id)
        }
      }
      setChecked(true)
    })
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav
        className="relative z-30 flex items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(10, 10, 26, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 217, 15, 0.1)',
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-xl tracking-wider transition-all duration-200"
            style={{ color: '#FFD90F' }}
          >
            <span style={{ color: '#8892b0' }}>{'>'}_</span> RALPHTHON
          </Link>
          <Link
            href="/timeline"
            className="text-sm transition-colors duration-200 hover:text-foreground"
            style={{ color: '#8892b0' }}
          >
            Timeline
          </Link>
          {checked && (
            teamId ? (
              <Link
                href={`/team/${teamId}`}
                className="text-sm transition-colors duration-200 hover:text-foreground"
                style={{ color: '#8892b0' }}
              >
                {t('myTeam')}
              </Link>
            ) : (
              <Link
                href="/register"
                className="text-sm transition-colors duration-200 hover:text-foreground"
                style={{ color: '#8892b0' }}
              >
                {t('register')}
              </Link>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-sm transition-all duration-200"
            style={{
              color: '#8892b0',
              border: '1px solid rgba(255, 217, 15, 0.1)',
            }}
          >
            {t('logout')}
          </button>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
