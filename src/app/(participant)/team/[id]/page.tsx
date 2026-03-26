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
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const lastLobsterAtRef = useRef<string | null>(null)
  const [lobsterActivatedAt, setLobsterActivatedAt] = useState<string | null>(null)
  const lobsterCountdown = useLobsterCountdown(lobsterActivatedAt)
  const isLobsterActive = lobsterCountdown > 0
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      setUrlError('File size must be under 100MB')
      return
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setUrlError('Only MP4, WebM, or MOV files are allowed')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUrlError(null)

    const ext = file.name.split('.').pop()
    const filePath = `${id}/${Date.now()}.${ext}`

    // Simulate progress since supabase-js doesn't expose upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 300)

    const { error } = await supabase.storage
      .from('demo-videos')
      .upload(filePath, file, { upsert: true })

    clearInterval(progressInterval)

    if (error) {
      setUrlError(`Upload failed: ${error.message}`)
      setUploading(false)
      setUploadProgress(0)
      return
    }

    const { data: urlData } = supabase.storage
      .from('demo-videos')
      .getPublicUrl(filePath)

    setUploadProgress(100)
    setDemoVideoUrl(urlData.publicUrl)

    // Save to DB immediately
    await supabase
      .from('teams')
      .update({ demo_video_url: urlData.publicUrl } as never)
      .eq('id', id)

    await fetchTeam()
    setUploading(false)
    setUploadProgress(0)
  }

  async function handleSaveTeam() {
    await supabase
      .from('teams')
      .update({ name: teamName, project_desc: projectDesc || null } as never)
      .eq('id', id)

    await fetchTeam()
    setEditingTeam(false)
  }

  async function handleSaveSubmission() {
    if (githubUrl && !isValidHttpsUrl(githubUrl)) {
      setUrlError('GitHub URL must start with https://')
      return
    }
    setUrlError(null)

    await supabase
      .from('teams')
      .update({
        github_url: githubUrl || null,
        demo_video_url: demoVideoUrl || null,
      } as never)
      .eq('id', id)

    await fetchTeam()
  }

  async function handleAddMember() {
    const email = newMemberEmail.trim()
    if (!email) return

    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: id, email, role: 'member' } as never)
      .select()
      .single()

    if (!error && data) {
      setMembers((prev) => [...prev, data as unknown as TeamMember])
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

  const isLeader = userId === team.leader_user_id

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
                {isLeader && (
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
              {isLeader && !editingMembers && (
                <button
                  onClick={() => setEditingMembers(true)}
                  className="text-xs transition-colors duration-200"
                  style={{ color: '#FFD90F' }}
                >
                  {t('editMembers')}
                </button>
              )}
              {isLeader && editingMembers && (
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
                  <span style={{ color: '#e2e8f0' }}>{member.email}</span>
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
                <div className="flex gap-2 mt-1">
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
                {isLeader ? (
                  <>
                    <input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      onBlur={handleSaveSubmission}
                      placeholder={t('submitGithubPlaceholder')}
                      className="h-10 w-full rounded-lg border bg-transparent px-3 text-sm"
                      style={{ borderColor: 'rgba(255, 217, 15, 0.2)', color: '#e2e8f0' }}
                    />
                    <p className="text-xs" style={{ color: '#E63946' }}>
                      {'\u26A0\uFE0F'} {t('submitGithubNote')}
                    </p>
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
                {isLeader ? (
                  <>
                    {demoVideoUrl ? (
                      <div className="flex flex-col gap-2">
                        {demoVideoUrl.includes('supabase') ? (
                          <video
                            src={demoVideoUrl}
                            controls
                            className="w-full rounded-lg"
                            style={{ border: '1px solid rgba(255, 217, 15, 0.15)', maxHeight: '300px' }}
                          />
                        ) : (
                          <SafeLink href={demoVideoUrl}>{demoVideoUrl}</SafeLink>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            setDemoVideoUrl('')
                            await supabase
                              .from('teams')
                              .update({ demo_video_url: null } as never)
                              .eq('id', id)
                            await fetchTeam()
                          }}
                          className="w-fit text-xs"
                          style={{ color: '#E63946' }}
                        >
                          {t('removeVideo')}
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="demoVideoUpload"
                        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-all duration-200 hover:border-yellow/40"
                        style={{
                          borderColor: uploading ? 'rgba(255, 217, 15, 0.4)' : 'rgba(255, 217, 15, 0.2)',
                          background: uploading ? 'rgba(255, 217, 15, 0.05)' : 'transparent',
                        }}
                      >
                        {uploading ? (
                          <>
                            <span className="text-2xl" style={{ animation: 'lobsterPulse 1s ease-in-out infinite' }}>
                              {'\u{1F4F9}'}
                            </span>
                            <span className="text-sm" style={{ color: '#FFD90F' }}>
                              {t('uploading')} {uploadProgress}%
                            </span>
                            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full" style={{ background: 'rgba(255, 217, 15, 0.15)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%`, background: '#FFD90F' }}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl">{'\u{1F4F9}'}</span>
                            <span className="text-sm" style={{ color: '#8892b0' }}>{t('dragOrClick')}</span>
                            <span className="text-xs" style={{ color: '#8892b0' }}>MP4, WebM, MOV (max 100MB)</span>
                            <span className="text-xs" style={{ color: '#E63946' }}>{'\u23F1\uFE0F'} {t('videoMaxLength')}</span>
                          </>
                        )}
                      </label>
                    )}
                    <input
                      id="demoVideoUpload"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </>
                ) : (
                  team.demo_video_url ? (
                    team.demo_video_url.includes('supabase') ? (
                      <video
                        src={team.demo_video_url}
                        controls
                        className="w-full rounded-lg"
                        style={{ border: '1px solid rgba(255, 217, 15, 0.15)', maxHeight: '300px' }}
                      />
                    ) : (
                      <SafeLink href={team.demo_video_url}>{team.demo_video_url}</SafeLink>
                    )
                  ) : (
                    <p className="text-sm" style={{ color: '#8892b0' }}>—</p>
                  )
                )}
              </div>
              {urlError && (
                <p className="text-sm" style={{ color: '#E63946' }}>{urlError}</p>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
