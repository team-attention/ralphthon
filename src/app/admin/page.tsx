'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { useLobsterCountdown, formatCountdown } from '@/lib/use-lobster-countdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Team = Database['public']['Tables']['teams']['Row']
type RegionFilter = 'ALL' | 'KR' | 'US'

function AdminTeamCard({
  team,
  isBlinking,
  isActivating,
  onSendLobster,
}: {
  team: Team
  isBlinking: boolean
  isActivating: boolean
  onSendLobster: (id: string) => void
}) {
  const t = useTranslations('admin')
  const countdown = useLobsterCountdown(team.lobster_activated_at)
  const isLobsterActive = countdown > 0
  // Only show as pending if requested AND not currently in countdown
  const isPendingLobster = team.lobster_requested && !isLobsterActive

  return (
    <Card
      className="relative overflow-hidden transition-shadow hover:shadow-md"
      style={
        isBlinking && !isLobsterActive
          ? { animation: 'redBlink 2s ease-in-out infinite' }
          : isPendingLobster
            ? { borderColor: 'rgba(230, 57, 70, 0.4)' }
            : undefined
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {team.name}
            {isPendingLobster && (
              <span
                className="text-lg"
                style={{ animation: 'lobsterPulse 1.5s ease-in-out infinite' }}
              >
                {'\u{1F99E}'}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {team.lobster_count > 0 && (
              <span className="text-sm" title={`${team.lobster_count} lobsters sent`}>
                {Array.from({ length: Math.min(team.lobster_count, 5) }, (_, i) => (
                  <span key={i}>{'\u{1F99E}'}</span>
                ))}
                {team.lobster_count > 5 && (
                  <span className="ml-0.5 text-xs" style={{ color: '#8892b0' }}>
                    +{team.lobster_count - 5}
                  </span>
                )}
              </span>
            )}
            <Badge variant="outline">{team.region}</Badge>
          </div>
        </div>
        <CardDescription>
          {team.project_desc
            ? team.project_desc.length > 100
              ? `${team.project_desc.slice(0, 100)}...`
              : team.project_desc
            : 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {isLobsterActive && (
            <div
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold"
              style={{
                background: 'rgba(230, 57, 70, 0.15)',
                border: '1px solid rgba(230, 57, 70, 0.3)',
                color: '#E63946',
              }}
            >
              <span style={{ animation: 'lobsterPulse 1.5s ease-in-out infinite' }}>
                {'\u{1F99E}'}
              </span>
              <span className="font-mono text-lg">{formatCountdown(countdown)}</span>
            </div>
          )}
          {isPendingLobster && !isLobsterActive && (
            <button
              disabled={isActivating}
              onClick={() => onSendLobster(team.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #E63946 0%, #c62828 100%)',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(230, 57, 70, 0.3)',
              }}
            >
              {isActivating ? (
                <span style={{ animation: 'lobsterPulse 0.5s ease-in-out infinite' }}>
                  {'\u{1F99E}'}
                </span>
              ) : (
                <>
                  <span className="text-lg">{'\u{1F99E}'}</span>
                  {t('sendLobster')}
                </>
              )}
            </button>
          )}
          {!isPendingLobster && !isLobsterActive && (
            <span className="text-xs" style={{ color: '#8892b0' }}>
              {team.lobster_count > 0 ? t('readyForNext') : t('noLobsterYet')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const t = useTranslations('admin')
  const supabase = useMemo(() => createClient(), [])
  const [teams, setTeams] = useState<Team[]>([])
  const [filter, setFilter] = useState<RegionFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [blinkingTeams, setBlinkingTeams] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        window.location.href = '/admin/login'
        return
      }

      // Check admin email pattern (same logic as API route)
      const adminPatterns = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)

      const email = user.email.toLowerCase()
      const isAdmin = adminPatterns.some((pattern) =>
        pattern.startsWith('@')
          ? email.endsWith(pattern)
          : email === pattern
      )

      if (!isAdmin) {
        window.location.href = '/admin/login'
        return
      }

      setAuthorized(true)

      const { data } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setTeams(data as unknown as Team[])
        // Start blinking for teams that already have pending lobster requests
        const pending = new Set<string>()
        for (const tt of data as unknown as Team[]) {
          if (tt.lobster_requested) pending.add(tt.id)
        }
        if (pending.size > 0) setBlinkingTeams(pending)
      }
      setLoading(false)
    }

    checkAdminAndFetch()
  }, [supabase])

  // Realtime subscription for lobster_requested changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-teams-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams',
        },
        (payload) => {
          const newRow = payload.new as Team
          const oldRow = payload.old as Partial<Team>

          // Update teams state with the new row data
          setTeams((prev) =>
            prev.map((tt) => (tt.id === newRow.id ? newRow : tt))
          )

          // If lobster_requested just became true, add to blinking set
          if (newRow.lobster_requested && !oldRow.lobster_requested) {
            setBlinkingTeams((prev) => {
              const next = new Set(prev)
              next.add(newRow.id)
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleSendLobster = useCallback(
    async (teamId: string) => {
      setActivatingId(teamId)
      const res = await fetch('/api/admin/lobster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      })

      if (res.ok) {
        setTeams((prev) =>
          prev.map((tt) =>
            tt.id === teamId
              ? {
                  ...tt,
                  lobster_activated: true,
                  lobster_activated_at: new Date().toISOString(),
                  lobster_requested: false,
                  lobster_count: tt.lobster_count + 1,
                }
              : tt
          )
        )
        setBlinkingTeams((prev) => {
          const next = new Set(prev)
          next.delete(teamId)
          return next
        })
      }
      setActivatingId(null)
    },
    []
  )

  const filteredTeams =
    filter === 'ALL' ? teams : teams.filter((tt) => tt.region === filter)

  const regionLabels: Record<RegionFilter, string> = {
    ALL: t('allRegions'),
    KR: t('korea'),
    US: t('usa'),
  }

  if (loading || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('noTeams')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>

        <div className="mb-6 flex gap-2">
          {(['ALL', 'KR', 'US'] as const).map((r) => (
            <Button
              key={r}
              variant={filter === r ? 'default' : 'outline'}
              onClick={() => setFilter(r)}
            >
              {regionLabels[r]}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <AdminTeamCard
              key={team.id}
              team={team}
              isBlinking={blinkingTeams.has(team.id)}
              isActivating={activatingId === team.id}
              onSendLobster={handleSendLobster}
            />
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <p className="text-center text-muted-foreground">{t('noTeams')}</p>
        )}
      </div>
    </div>
  )
}
