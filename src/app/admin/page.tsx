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
type RegionFilter = 'ALL' | 'KR' | 'US'

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
              onClick={(e) => { e.stopPropagation(); onSendLobster(team.id) }}
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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

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
