'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { LocaleSwitcher } from '@/components/locale-switcher'

const NAV_TONES = {
  yellow: { hoverClassName: 'hover:bg-[rgba(255,217,15,0.1)]', color: '#FFD90F', background: 'rgba(255, 217, 15, 0.1)' },
  teal: { hoverClassName: 'hover:bg-[rgba(100,255,218,0.1)]', color: '#64ffda', background: 'rgba(100, 255, 218, 0.1)' },
}

function NavLink({
  href,
  active,
  tone = 'yellow',
  children,
}: {
  href: string
  active: boolean
  tone?: keyof typeof NAV_TONES
  children: React.ReactNode
}) {
  const colors = NAV_TONES[tone]
  return (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1 text-sm transition-all duration-200 ${colors.hoverClassName}`}
      style={{
        color: active ? colors.color : '#8892b0',
        background: active ? colors.background : undefined,
      }}
    >
      {children}
    </Link>
  )
}

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const [teamId, setTeamId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true)
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
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
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
          <NavLink href="/guide" active={pathname === '/guide'}>
            Guide
          </NavLink>
          <NavLink href="/support" active={pathname === '/support'} tone="teal">
            Sponsor
          </NavLink>
          {checked && (
            teamId ? (
              <NavLink href={`/team/${teamId}`} active={pathname.startsWith('/team/')}>
                {t('myTeam')}
              </NavLink>
            ) : (
              <NavLink href="/register" active={pathname === '/register' || pathname === '/login'}>
                {t('register')}
              </NavLink>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm transition-all duration-200 hover:bg-[rgba(255,217,15,0.1)]"
              style={{
                color: '#8892b0',
                border: '1px solid rgba(255, 217, 15, 0.1)',
              }}
            >
              {t('logout')}
            </button>
          )}
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
