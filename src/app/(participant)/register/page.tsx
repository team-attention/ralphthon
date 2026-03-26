'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { HackathonBg } from '@/components/hackathon-bg'

export default function RegisterPage() {
  const t = useTranslations('register')
  const tc = useTranslations('common')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [teamName, setTeamName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [region, setRegion] = useState<'KR' | 'US'>('KR')
  const [projectDesc, setProjectDesc] = useState('')
  const [members, setMembersInput] = useState<{ name: string; email: string }[]>([{ name: '', email: '' }])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: currentUser } }) => {
      if (!currentUser) {
        router.replace('/login')
        return
      }

      // Guard: if user is already a team leader, redirect to team page
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('leader_user_id', currentUser.id)
        .single()

      if (existingTeam) {
        const teamData = existingTeam as { id: string }
        router.replace(`/team/${teamData.id}`)
        return
      }

      // Guard: if user is already a team member, link user_id and redirect
      const { data: memberRow } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('email', currentUser.email!)
        .limit(1)
        .single()

      if (memberRow) {
        await supabase
          .from('team_members')
          .update({ user_id: currentUser.id } as never)
          .eq('email', currentUser.email!)
          .is('user_id', null)

        const member = memberRow as { team_id: string }
        router.replace(`/team/${member.team_id}`)
        return
      }

      setUser(currentUser)

      // Auto-set region from locale
      const locale =
        document.cookie
          .split('; ')
          .find((c) => c.startsWith('NEXT_LOCALE='))
          ?.split('=')[1] ||
        document.documentElement.lang ||
        'ko'
      setRegion(locale === 'en' ? 'US' : 'KR')

      setLoading(false)
    })
  }, [router, supabase])

  function addMember() {
    setMembersInput((prev) => [...prev, { name: '', email: '' }])
  }

  function removeMember(index: number) {
    setMembersInput((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMemberField(index: number, field: 'name' | 'email', value: string) {
    setMembersInput((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)

    type TeamInsert = Database['public']['Tables']['teams']['Insert']
    type MemberInsert = Database['public']['Tables']['team_members']['Insert']

    const teamPayload: TeamInsert = {
      name: teamName,
      region,
      leader_email: user.email!,
      leader_user_id: user.id,
      project_desc: projectDesc || null,
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert(teamPayload as never)
      .select('id')
      .single()

    if (teamError || !team) {
      setSubmitting(false)
      return
    }

    const teamData = team as { id: string }

    const memberRows: MemberInsert[] = [
      { team_id: teamData.id, name: leaderName.trim() || null, email: user.email!, role: 'leader' },
      ...members
        .filter((m) => m.email.trim() !== '')
        .map((m) => ({
          team_id: teamData.id,
          name: m.name.trim() || null,
          email: m.email.trim(),
          role: 'member' as const,
        })),
    ]

    await supabase.from('team_members').insert(memberRows as never[])

    router.push(`/team/${teamData.id}`)
  }

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <HackathonBg showQuotes={false} />

      <div
        className="relative z-20 w-full max-w-lg glass-card rounded-xl p-8"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl tracking-wider" style={{ color: '#FFD90F' }}>
            {t('title')}
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#8892b0' }}>
            <span style={{ color: '#45B649' }}>{'$'}</span> team init --interactive
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Team Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="teamName" className="text-sm font-medium" style={{ color: '#FFD90F' }}>
              <span style={{ color: '#8892b0' }}>{'>'}</span> {t('teamName')}
            </label>
            <input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={t('teamNamePlaceholder')}
              required
              className="h-10 w-full rounded-lg border bg-transparent px-3 text-sm transition-all"
              style={{
                borderColor: 'rgba(255, 217, 15, 0.2)',
                color: '#e2e8f0',
              }}
            />
          </div>

          {/* Region */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#FFD90F' }}>
              <span style={{ color: '#8892b0' }}>{'>'}</span> {t('region')}
            </label>
            <div className="flex gap-2">
              {(['KR', 'US'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: region === r ? '#FFD90F' : 'rgba(255, 217, 15, 0.15)',
                    background: region === r ? 'rgba(255, 217, 15, 0.1)' : 'transparent',
                    color: region === r ? '#FFD90F' : '#8892b0',
                    boxShadow: region === r ? '0 0 12px rgba(255, 217, 15, 0.15)' : 'none',
                  }}
                >
                  {r === 'KR' ? '\u{1F1F0}\u{1F1F7} KR' : '\u{1F1FA}\u{1F1F8} US'}
                </button>
              ))}
            </div>
          </div>

          {/* Project Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="projectDesc" className="text-sm font-medium" style={{ color: '#FFD90F' }}>
              <span style={{ color: '#8892b0' }}>{'>'}</span> {t('projectDescription')}
            </label>
            <textarea
              id="projectDesc"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder={t('projectDescPlaceholder')}
              rows={3}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-all"
              style={{
                borderColor: 'rgba(255, 217, 15, 0.2)',
                color: '#e2e8f0',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Team Members */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: '#FFD90F' }}>
              <span style={{ color: '#8892b0' }}>{'>'}</span> {t('teamMembers')}
            </label>

            {/* Leader row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder={t('memberName')}
                required
                className="h-10 w-1/3 rounded-lg border bg-transparent px-3 text-sm transition-all"
                style={{
                  borderColor: 'rgba(255, 217, 15, 0.2)',
                  color: '#e2e8f0',
                }}
              />
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="h-10 flex-1 rounded-lg border bg-transparent px-3 text-sm transition-all"
                style={{
                  borderColor: 'rgba(255, 217, 15, 0.2)',
                  color: '#8892b0',
                  opacity: 0.7,
                }}
              />
              <span
                className="flex h-10 items-center justify-center rounded-lg border px-2 text-xs font-medium"
                style={{
                  borderColor: 'rgba(255, 217, 15, 0.4)',
                  background: 'rgba(255, 217, 15, 0.1)',
                  color: '#FFD90F',
                  whiteSpace: 'nowrap',
                }}
              >
                Leader
              </span>
            </div>

            {/* Other members */}
            {members.map((member, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMemberField(index, 'name', e.target.value)}
                  placeholder={t('memberName')}
                  className="h-10 w-1/3 rounded-lg border bg-transparent px-3 text-sm transition-all"
                  style={{
                    borderColor: 'rgba(255, 217, 15, 0.2)',
                    color: '#e2e8f0',
                  }}
                />
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateMemberField(index, 'email', e.target.value)}
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                  title="Enter a valid email address"
                  placeholder={t('memberEmail')}
                  className="h-10 flex-1 rounded-lg border bg-transparent px-3 text-sm transition-all"
                  style={{
                    borderColor: 'rgba(255, 217, 15, 0.2)',
                    color: '#e2e8f0',
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm transition-all duration-200"
                  style={{
                    borderColor: 'rgba(255, 217, 15, 0.2)',
                    color: '#8892b0',
                  }}
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMember}
              className="w-full rounded-lg border border-dashed px-4 py-2 text-sm transition-all duration-200"
              style={{
                borderColor: 'rgba(255, 217, 15, 0.2)',
                color: '#8892b0',
              }}
            >
              + {t('addMember')}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !teamName}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-display text-xl tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: '#FFD90F',
              color: '#0a0a1a',
            }}
          >
            {submitting ? (
              <>
                <span style={{ animation: 'lobsterPulse 1s ease-in-out infinite' }}>{'\u{1F99E}'}</span>
                {t('submitting')}
              </>
            ) : (
              <>
                {'\u{1F99E}'} {t('submitTeam')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
