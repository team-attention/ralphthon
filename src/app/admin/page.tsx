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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type Team = Database['public']['Tables']['teams']['Row']
type TeamMember = Database['public']['Tables']['team_members']['Row']
type RegionFilter = 'KR' | 'US'

function ProjectDetailDialog({
  team,
  members,
  open,
  onOpenChange,
}: {
  team: Team | null
  members: TeamMember[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('admin')

  if (!team) return null

  const hasGithub = !!team.github_url
  const hasVideo = !!team.demo_video_url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {team.name}
            <Badge variant="outline">{team.region}</Badge>
          </DialogTitle>
          <DialogDescription>{team.leader_email}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Submission Status */}
          <div className="flex gap-2">
            <Badge variant={hasGithub ? 'default' : 'outline'}>
              GitHub: {hasGithub ? t('submitted') : t('missing')}
            </Badge>
            <Badge variant={hasVideo ? 'default' : 'outline'}>
              Video: {hasVideo ? t('submitted') : t('missing')}
            </Badge>
            {team.lobster_count > 0 && (
              <Badge variant="outline">
                {'\u{1F99E}'} {team.lobster_count}
              </Badge>
            )}
          </div>

          {/* Project Description */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: '#8892b0' }}>
              {t('projectDesc')}
            </p>
            <p className="text-sm">
              {team.project_desc || t('noDescription')}
            </p>
          </div>

          {/* GitHub URL */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: '#8892b0' }}>
              {t('githubUrl')}
            </p>
            {team.github_url ? (
              <a
                href={team.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-sm underline underline-offset-2 hover:text-foreground"
                style={{ color: '#64ffda' }}
              >
                {team.github_url}
              </a>
            ) : (
              <p className="text-sm" style={{ color: '#8892b0' }}>{t('noGithub')}</p>
            )}
          </div>

          {/* Demo Video */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: '#8892b0' }}>
              {t('demoVideo')}
            </p>
            {team.demo_video_url ? (
              <a
                href={team.demo_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-sm underline underline-offset-2 hover:text-foreground"
                style={{ color: '#64ffda' }}
              >
                {team.demo_video_url}
              </a>
            ) : (
              <p className="text-sm" style={{ color: '#8892b0' }}>{t('noVideo')}</p>
            )}
          </div>

          {/* Team Members */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: '#8892b0' }}>
              {t('teamMembers')} ({members.length})
            </p>
            <div className="flex flex-col gap-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {m.role === 'leader' ? t('leader') : t('member')}
                  </Badge>
                  {m.name && <span className="font-medium">{m.name}</span>}
                  <span style={{ color: '#8892b0' }}>{m.email}</span>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm" style={{ color: '#8892b0' }}>No members</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AdminTeamCard({
  team,
  isBlinking,
  isActivating,
  onSendLobster,
  onClick,
}: {
  team: Team
  isBlinking: boolean
  isActivating: boolean
  onSendLobster: (id: string) => void
  onClick: () => void
}) {
  const t = useTranslations('admin')
  const countdown = useLobsterCountdown(team.lobster_activated_at)
  const isLobsterActive = countdown > 0
  // Only show as pending if requested AND not currently in countdown
  const isPendingLobster = team.lobster_requested && !isLobsterActive

  return (
    <Card
      className="relative cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
      onClick={onClick}
      style={
        isBlinking && !isLobsterActive
          ? { animation: 'redBlink 2s ease-in-out infinite' }
          : isPendingLobster
            ? { borderColor: 'rgba(230, 57, 70, 0.4)' }
            : undefined
      }
    >
      <CardHeader className="pb-3">
        <CardTitle className="break-words">
          {team.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {team.project_desc || 'No description'}
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
          {isPendingLobster && !isLobsterActive ? (
            <button
              disabled={isActivating}
              onClick={(e) => { e.stopPropagation(); onSendLobster(team.id) }}
              className="flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-bold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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
          ) : !isLobsterActive && (
            <div className="flex items-center gap-2">
              <Badge variant={team.github_url ? 'default' : 'outline'} className="text-xs">
                {team.github_url ? 'Submitted' : 'Ralphing'}
              </Badge>
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// SF ralphing ends: 2026-03-28 3:30 PM PDT (UTC-7) = 2026-03-28T22:30:00Z
const SF_DEADLINE = new Date('2026-03-28T22:30:00Z')
// Seoul ralphing ends: 2026-03-29 5:00 PM KST (UTC+9) = 2026-03-29T08:00:00Z
const SEOUL_DEADLINE = new Date('2026-03-29T08:00:00Z')

function useRegionCountdown(filter: RegionFilter) {
  const [remaining, setRemaining] = useState<{ sf: number | null; seoul: number | null }>({ sf: null, seoul: null })

  useEffect(() => {
    function update() {
      const sfDiff = SF_DEADLINE.getTime() - Date.now()
      const seoulDiff = SEOUL_DEADLINE.getTime() - Date.now()
      setRemaining({
        sf: sfDiff > 0 ? sfDiff : 0,
        seoul: seoulDiff > 0 ? seoulDiff : 0,
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  function fmt(ms: number | null): string | null {
    if (ms === null) return null
    if (ms <= 0) return '00:00:00'
    const h = Math.floor(ms / 3_600_000)
    const m = Math.floor((ms % 3_600_000) / 60_000)
    const s = Math.floor((ms % 60_000) / 1_000)
    const d = Math.floor(h / 24)
    const hh = h % 24
    if (d > 0) return `${d}d ${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return filter === 'US'
    ? { label: 'SF 3:30 PM', value: fmt(remaining.sf) }
    : { label: 'Seoul 5:00 PM', value: fmt(remaining.seoul) }
}

export default function DashboardPage() {
  const t = useTranslations('admin')
  const supabase = useMemo(() => createClient(), [])
  const [teams, setTeams] = useState<Team[]>([])
  const [filter, setFilter] = useState<RegionFilter>('US')
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [blinkingTeams, setBlinkingTeams] = useState<Set<string>>(new Set())
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const countdownEntry = useRegionCountdown(filter)

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

  const handleCardClick = useCallback(
    async (team: Team) => {
      setSelectedTeam(team)
      setDialogOpen(true)
      const res = await fetch(`/api/admin/team-members?teamId=${team.id}`)
      if (res.ok) {
        const { members } = await res.json()
        setSelectedMembers(members as TeamMember[])
      }
    },
    []
  )

  const filteredTeams = teams.filter((tt) => tt.region === filter)

  const regionLabels: Record<RegionFilter, string> = {
    US: 'SF',
    KR: 'Seoul',
  }

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  if (loading || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('noTeams')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className={isFullscreen ? '' : 'mx-auto max-w-[1800px]'}>
        {/* Header - hidden in fullscreen */}
        {!isFullscreen && (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Ralphers</h1>
            <div className="flex items-center gap-3">
              {/* Region countdown */}
              {countdownEntry.value !== null && (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{
                    background: countdownEntry.value === '00:00:00'
                      ? 'rgba(230, 57, 70, 0.15)'
                      : 'rgba(255, 217, 15, 0.1)',
                    border: `1px solid ${countdownEntry.value === '00:00:00' ? 'rgba(230, 57, 70, 0.3)' : 'rgba(255, 217, 15, 0.2)'}`,
                  }}
                >
                  <span className="text-xs" style={{ color: '#8892b0' }}>
                    {countdownEntry.label}
                  </span>
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: countdownEntry.value === '00:00:00' ? '#E63946' : '#FFD90F' }}
                  >
                    {countdownEntry.value}
                  </span>
                </div>
              )}
              {/* Fullscreen toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </Button>
            </div>
          </div>
        )}

        {/* Region tabs - always visible */}
        <div className={`flex items-center gap-2 ${isFullscreen ? 'mb-4' : 'mb-6'}`}>
          {(['US', 'KR'] as const).map((r) => (
            <Button
              key={r}
              variant={filter === r ? 'default' : 'outline'}
              onClick={() => setFilter(r)}
            >
              {regionLabels[r]}
            </Button>
          ))}
          {/* Countdown + fullscreen exit in fullscreen mode */}
          {isFullscreen && (
            <div className="ml-auto flex items-center gap-3">
              {countdownEntry.value !== null && (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{
                    background: countdownEntry.value === '00:00:00'
                      ? 'rgba(230, 57, 70, 0.15)'
                      : 'rgba(255, 217, 15, 0.1)',
                    border: `1px solid ${countdownEntry.value === '00:00:00' ? 'rgba(230, 57, 70, 0.3)' : 'rgba(255, 217, 15, 0.2)'}`,
                  }}
                >
                  <span className="text-xs" style={{ color: '#8892b0' }}>
                    {countdownEntry.label}
                  </span>
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: countdownEntry.value === '00:00:00' ? '#E63946' : '#FFD90F' }}
                  >
                    {countdownEntry.value}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                title="Exit fullscreen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredTeams.map((team) => (
            <AdminTeamCard
              key={team.id}
              team={team}
              isBlinking={blinkingTeams.has(team.id)}
              isActivating={activatingId === team.id}
              onSendLobster={handleSendLobster}
              onClick={() => handleCardClick(team)}
            />
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <p className="text-center text-muted-foreground">{t('noTeams')}</p>
        )}

        <ProjectDetailDialog
          team={selectedTeam}
          members={selectedMembers}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setSelectedTeam(null)
              setSelectedMembers([])
            }
          }}
        />
      </div>
    </div>
  )
}
