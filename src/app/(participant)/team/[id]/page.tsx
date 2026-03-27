'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { LobsterEffect } from '@/components/lobster-effect'
import { HackathonBg } from '@/components/hackathon-bg'
import { useLobsterCountdown, formatCountdown } from '@/lib/use-lobster-countdown'

type Team = Database['public']['Tables']['teams']['Row']
type TeamMember = Database['public']['Tables']['team_members']['Row']

function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function SafeLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (!isValidHttpsUrl(href)) {
    return <span className="text-sm" style={{ color: '#8892b0' }}>{String(children)}</span>
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm underline transition-colors duration-200"
      style={{ color: '#FFD90F' }}
    >
      {children}
    </a>
  )
}

export default function TeamPage() {
  const t = useTranslations('team')
  const tc = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = useMemo(() => createClient(), [])

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState(false)
  const [lobsterEffect, setLobsterEffect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [urlError, setUrlError] = useState<string | null>(null)

  const [teamName, setTeamName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoVideoUrl, setDemoVideoUrl] = useState('')
  const [editingMembers, setEditingMembers] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const lastLobsterAtRef = useRef<string | null>(null)
  const [lobsterActivatedAt, setLobsterActivatedAt] = useState<string | null>(null)
  const lobsterCountdown = useLobsterCountdown(lobsterActivatedAt)
  const isLobsterActive = lobsterCountdown > 0
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      const teamData = data as unknown as Team
      setTeam(teamData)
      setTeamName(teamData.name)
      setProjectDesc(teamData.project_desc || '')
      setGithubUrl(teamData.github_url || '')
      setDemoVideoUrl(teamData.demo_video_url || '')
      lastLobsterAtRef.current = teamData.lobster_activated_at
      setLobsterActivatedAt(teamData.lobster_activated_at)
    }
  }, [id, supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setUserId(user.id)

      await fetchTeam()

      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', id)

      if (membersData) setMembers(membersData as unknown as TeamMember[])
      setLoading(false)
    }

    init()
  }, [id, router, fetchTeam, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`team-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newTeam = payload.new as Team
          setTeam(newTeam)

          // Trigger lobster effect when lobster_activated_at changes
          if (
            newTeam.lobster_activated_at &&
            newTeam.lobster_activated_at !== lastLobsterAtRef.current
          ) {
            lastLobsterAtRef.current = newTeam.lobster_activated_at
            setLobsterActivatedAt(newTeam.lobster_activated_at)
            setLobsterEffect(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, supabase])

  async function handleLobsterRequest() {
    await supabase
      .from('teams')
      .update({ lobster_requested: true } as never)
      .eq('id', id)

    setTeam((prev) => (prev ? { ...prev, lobster_requested: true } : prev))
  }

  const [submitting, setSubmitting] = useState(false)

  async function handleSaveTeam() {
    await supabase
      .from('teams')
      .update({ name: teamName, project_desc: projectDesc || null } as never)
      .eq('id', id)

    await fetchTeam()
    setEditingTeam(false)
  }

  async function handleSaveSubmission() {
    const githubMissing = !githubUrl
    const videoMissing = !demoVideoUrl
    const githubInvalid = githubUrl && !isValidHttpsUrl(githubUrl)
    const videoInvalid = demoVideoUrl && !isValidHttpsUrl(demoVideoUrl)

    setUrlError(githubMissing ? t('submitGithubRequired') : githubInvalid ? t('submitGithubNote') : null)
    setVideoUrlError(videoMissing ? t('videoUrlRequired') : videoInvalid ? t('videoUrlInvalid') : null)

    if (githubMissing || videoMissing || githubInvalid || videoInvalid) return

    setSubmitting(true)

    await supabase
      .from('teams')
      .update({
        github_url: githubUrl || null,
        demo_video_url: demoVideoUrl || null,
      } as never)
      .eq('id', id)

    await fetchTeam()
    setSubmitting(false)
  }

  async function handleAddMember() {
    const email = newMemberEmail.trim()
    if (!email) return
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) return
    const name = newMemberName.trim() || null

    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: id, name, email, role: 'member' } as never)
      .select()
      .single()

    if (!error && data) {
      setMembers((prev) => [...prev, data as unknown as TeamMember])
      setNewMemberName('')
      setNewMemberEmail('')
    }
  }

  async function handleRemoveMember(memberId: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    }
  }

  const handleDismissLobster = useCallback(() => {
    setLobsterEffect(false)
  }, [])

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <HackathonBg showQuotes={false} />
        <div className="relative z-20 flex items-center gap-3">
          <span className="text-2xl" style={{ animation: 'lobsterPulse 1.5s ease-in-out infinite' }}>
            {'\u{1F99E}'}
          </span>
          <p style={{ color: '#8892b0' }}>{tc('loading')}</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <HackathonBg showQuotes={false} />
        <p className="relative z-20" style={{ color: '#8892b0' }}>Team not found</p>
      </div>
    )
  }

  const isTeamMember = userId === team.leader_user_id || members.some((m) => m.user_id === userId)

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden p-4 pt-8">
      <HackathonBg />
      <LobsterEffect active={lobsterEffect} onDismiss={handleDismissLobster} />

      <div
        className="relative z-20 w-full max-w-2xl glass-card rounded-xl p-8"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-wider" style={{ color: '#FFD90F' }}>
              {team.name}
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#8892b0' }}>
              {t('region')}: <span style={{ color: '#e2e8f0' }}>{team.region === 'KR' ? '\u{1F1F0}\u{1F1F7} KR' : '\u{1F1FA}\u{1F1F8} US'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Lobster Active Countdown */}
            {isLobsterActive && (
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-bold"
                style={{
                  background: 'rgba(230, 57, 70, 0.2)',
                  color: '#E63946',
                  border: '1px solid rgba(230, 57, 70, 0.4)',
                  animation: 'lobsterGlow 2s ease-in-out infinite',
                }}
              >
                <span style={{ animation: 'lobsterPulse 1.5s ease-in-out infinite' }}>
                  {'\u{1F99E}'}
                </span>
                {formatCountdown(lobsterCountdown)}
              </span>
            )}
            {/* Requested badge */}
            {!isLobsterActive && team.lobster_requested && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: 'rgba(255, 217, 15, 0.15)',
                  color: '#FFD90F',
                  border: '1px solid rgba(255, 217, 15, 0.3)',
                }}
              >
                {'\u{1F99E}'} {t('lobsterRequested')}
              </span>
            )}
            {/* Request Button */}
            {!team.lobster_requested && !isLobsterActive && (
              <button
                onClick={handleLobsterRequest}
                className="group relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 font-display text-sm tracking-wider transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]"
                style={{
                  background: 'linear-gradient(135deg, #E63946 0%, #c62828 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(230, 57, 70, 0.3)',
                }}
              >
                <span style={{ animation: 'float 2s ease-in-out infinite' }}>
                  {'\u{1F99E}'}
                </span>
                {t('requestLobster')}
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Team Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: '#FFD90F' }}>
              <span>{'>'}</span> {t('teamInfo')}
            </h2>

            {editingTeam ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="editTeamName" className="text-sm font-medium" style={{ color: '#8892b0' }}>
                    {t('teamName')}
                  </label>
                  <input
                    id="editTeamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    maxLength={20}
                    className="h-10 w-full rounded-lg border bg-transparent px-3 font-display text-xl tracking-wider"
                    style={{ borderColor: 'rgba(255, 217, 15, 0.2)', color: '#FFD90F' }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="editProjectDesc" className="text-sm font-medium" style={{ color: '#8892b0' }}>
                    {t('projectDescription')}
                  </label>
                  <textarea
                    id="editProjectDesc"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
                    style={{ borderColor: 'rgba(255, 217, 15, 0.2)', color: '#e2e8f0', resize: 'vertical' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTeam}
                    className="rounded-lg px-5 py-2 font-display text-lg tracking-wider transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: '#FFD90F', color: '#0a0a1a' }}
                  >
                    {t('save')}
                  </button>
                  <button
                    onClick={() => { setEditingTeam(false); setUrlError(null) }}
                    className="rounded-lg border px-5 py-2 text-sm transition-all duration-200"
                    style={{ borderColor: 'rgba(255, 217, 15, 0.2)', color: '#8892b0' }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: '#8892b0' }}>
                    {t('projectDescription')}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: '#e2e8f0' }}>
                    {team.project_desc || 'No description yet'}
                  </p>
                </div>
                {isTeamMember && (
                  <button
                    onClick={() => setEditingTeam(true)}
                    className="w-fit rounded-lg border px-4 py-2 text-sm transition-all duration-200 hover:border-yellow/40"
                    style={{ borderColor: 'rgba(255, 217, 15, 0.2)', color: '#8892b0' }}
                  >
                    {t('edit')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px w-full" style={{ background: 'rgba(255, 217, 15, 0.1)' }} />

          {/* Team Members */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider" style={{ color: '#8892b0' }}>
                {t('teamMembers')}
              </h3>
              {isTeamMember && !editingMembers && (
                <button
                  onClick={() => setEditingMembers(true)}
                  className="text-xs transition-colors duration-200"
                  style={{ color: '#FFD90F' }}
                >
                  {t('editMembers')}
                </button>
              )}
              {isTeamMember && editingMembers && (
                <button
                  onClick={() => setEditingMembers(false)}
                  className="text-xs transition-colors duration-200"
                  style={{ color: '#8892b0' }}
                >
                  {t('cancel')}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
                  style={{
                    background: 'rgba(22, 33, 62, 0.6)',
                    border: '1px solid rgba(255, 217, 15, 0.08)',
                  }}
                >
                  <div className="flex flex-col">
                    {member.name && (
                      <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{member.name}</span>
                    )}
                    <span className={member.name ? 'text-xs' : 'text-sm'} style={{ color: member.name ? '#8892b0' : '#e2e8f0' }}>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{
                        background: member.role === 'leader'
                          ? 'rgba(255, 217, 15, 0.15)'
                          : 'rgba(136, 146, 176, 0.15)',
                        color: member.role === 'leader' ? '#FFD90F' : '#8892b0',
                        border: `1px solid ${member.role === 'leader' ? 'rgba(255, 217, 15, 0.3)' : 'rgba(136, 146, 176, 0.2)'}`,
                      }}
                    >
                      {member.role === 'leader' ? t('leader') : t('member')}
                    </span>
                    {editingMembers && member.role !== 'leader' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="rounded px-2 py-0.5 text-xs transition-colors duration-200"
                        style={{ color: '#E63946' }}
                      >
                        {t('removeMember')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {editingMembers && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder={t('newMemberName')}
                      className="h-9 w-1/3 rounded-lg border bg-transparent px-3 text-sm"
                      style={{ borderColor: 'rgba(255, 217, 15, 0.2)', color: '#e2e8f0' }}
                    />
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddMember() }}
                      placeholder={t('newMemberEmail')}
                      className="h-9 flex-1 rounded-lg border bg-transparent px-3 text-sm"
                      style={{ borderColor: 'rgba(255, 217, 15, 0.2)', color: '#e2e8f0' }}
                    />
                    <button
                      onClick={handleAddMember}
                      className="rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                      style={{ background: '#FFD90F', color: '#0a0a1a' }}
                    >
                      {t('addMember')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full" style={{ background: 'rgba(255, 217, 15, 0.1)' }} />

          {/* Section 2: Submit */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: '#E63946' }}>
              <span>{'>'}</span> {t('submitSection')}
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wider" style={{ color: '#8892b0' }}>
                  {t('submitGithub')}
                </p>
                {isTeamMember ? (
                  <>
                    <input
                      value={githubUrl}
                      onChange={(e) => { setGithubUrl(e.target.value); setUrlError(null) }}
                      placeholder={t('submitGithubPlaceholder')}
                      className="h-10 w-full rounded-lg border bg-transparent px-3 text-sm"
                      style={{ borderColor: urlError ? 'rgba(230, 57, 70, 0.5)' : 'rgba(255, 217, 15, 0.2)', color: '#e2e8f0' }}
                    />
                    {urlError ? (
                      <p className="text-xs" style={{ color: '#E63946' }}>{urlError}</p>
                    ) : (
                      <p className="text-xs" style={{ color: '#E63946' }}>
                        {'\u26A0\uFE0F'} {t('submitGithubNote')}
                      </p>
                    )}
                  </>
                ) : (
                  team.github_url ? (
                    <SafeLink href={team.github_url}>{team.github_url}</SafeLink>
                  ) : (
                    <p className="text-sm" style={{ color: '#8892b0' }}>—</p>
                  )
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wider" style={{ color: '#8892b0' }}>
                  {t('demoVideo')}
                </p>
                {isTeamMember ? (
                  <>
                    <input
                      value={demoVideoUrl}
                      onChange={(e) => { setDemoVideoUrl(e.target.value); setVideoUrlError(null) }}
                      placeholder={t('demoVideoPlaceholder')}
                      className="h-10 w-full rounded-lg border bg-transparent px-3 text-sm"
                      style={{ borderColor: videoUrlError ? 'rgba(230, 57, 70, 0.5)' : 'rgba(255, 217, 15, 0.2)', color: '#e2e8f0' }}
                    />
                    {videoUrlError && (
                      <p className="text-xs" style={{ color: '#E63946' }}>{videoUrlError}</p>
                    )}
                    <p className="text-xs" style={{ color: '#8892b0' }}>
                      {t('demoVideoHint')}
                    </p>
                  </>
                ) : (
                  team.demo_video_url ? (
                    <SafeLink href={team.demo_video_url}>{team.demo_video_url}</SafeLink>
                  ) : (
                    <p className="text-sm" style={{ color: '#8892b0' }}>—</p>
                  )
                )}
              </div>
              {isTeamMember && (
                <button
                  onClick={handleSaveSubmission}
                  disabled={submitting}
                  className="w-full rounded-lg px-5 py-3 font-display text-lg tracking-wider transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: '#E63946', color: '#ffffff' }}
                >
                  {submitting ? tc('loading') : t('submitButton')}
                </button>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
