'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Team = Database['public']['Tables']['teams']['Row']

interface JudgeGroup {
  judge: string
  teamIds: string[]
  picks: number // number of finalists to select
}

const JUDGE_GROUPS: JudgeGroup[] = [
  {
    judge: '한기용',
    picks: 1,
    teamIds: [
      'df16c443-18fd-4696-aaf1-d0803c210084', // 엑셀 팬션? 사용하지 마세요
      'eba7119b-4be3-46a7-bb75-b8873d7542ab', // Mindful Labs
      'd21f103a-699b-4dce-b06b-a68c389af7e7', // bookworm
      '6bacc276-0fb8-4193-9efb-3cdc6a740928', // Supermango
      '5c7af365-b59b-42e6-a909-281f836624df', // Sunhoo Kim
      'b5a0de72-da3d-4944-8367-7ac9a2944457', // Dee
      '4714d60a-8788-4c89-a5ac-07b8c679c215', // SELF_RALPH
    ],
  },
  {
    judge: '이태양',
    picks: 1,
    teamIds: [
      '4c975ee1-1e3f-447c-8071-ec9a99467314', // Nudge
      'dc57a4af-0c03-4e7c-8e8b-24baae37fc22', // BlueLog
      '75cfb371-b4f5-4211-8527-85b49fce907d', // WooWooMo
      '66a2a913-4718-4628-b07c-f6fd12196af9', // One For All
      '08f2aad5-6aaa-49f7-b50c-46c93cd488a7', // Team Kaos(aka.chaos)
      'e8502311-6b0b-49cc-ae1e-8023b1c74c80', // GhostView
      '9dd1c8ab-8084-4370-b165-25ddf39d15cd', // ha-fam
    ],
  },
  {
    judge: '제프리+이재규',
    picks: 2,
    teamIds: [
      '76445e52-b1ad-4f43-a103-082f5dc9ccc7', // cosmos-makers
      '02996966-b073-4055-93b1-ff6ba6c29e4c', // AER
      '7ddf068f-b2de-48b6-8395-04ea604786bd', // 032926,Today
      'd73746bc-868b-43fa-97a5-1860629c0a36', // Agent Ludens
      '74ed2eee-8038-44e0-be4b-c5f8b99873ed', // Dormammu
      'e3342f6a-3e55-40e1-898b-d25ee37e90d0', // SwarmOps
      'b615b0e2-e5ac-40d9-915a-fcdd353caf7d', // DigestAnything
      '81b052fc-fbff-4725-8074-c3aa9d98e420', // mk48
      'df3c9484-0a14-451f-b8cb-96a96cf8dc55', // dragon stone
      'a108643b-238b-4945-9c39-f119063dd2a8', // Aristo
    ],
  },
  {
    judge: '이상희',
    picks: 1,
    teamIds: [
      '0b8ce66b-9250-4fca-b9d2-395dac1c89ad', // auto-hunt
      'e40f4eab-ab7b-4660-874d-cb90ce3bf75f', // gowider
      'ec85f3e9-1e61-4b97-9691-81d7b08389dc', // Team GP
      '37b91609-7583-40f6-a90a-cd74cee3a0f2', // polysona
      '47ce902d-c8f0-4bf9-9e66-6ee805092ca7', // Nomadams
      '509e7c84-8adf-4910-9fba-3de8f14eac03', // Nexus
      'ef11b28e-d8f2-4a08-a0f8-3ac0db4f3594', // 비버와 사육사
    ],
  },
]

const CRITERIA = [
  { key: 'score_impact', label: '비즈니스 임팩트', emoji: '🚀' },
  { key: 'score_technical', label: '랄프 기술 완성도', emoji: '🦞' },
] as const

type CriteriaKey = (typeof CRITERIA)[number]['key']

interface TeamScore {
  [key: string]: number | null | string | undefined
  score_creativity: number | null
  score_technical: number | null
  score_impact: number | null
  score_presentation: number | null
  comment: string
}

function getStorageKey(judge: string) {
  return `ralphthon_judging_${judge}`
}

function loadScoresFromStorage(judge: string): Record<string, TeamScore> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(getStorageKey(judge))
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveScoresToStorage(judge: string, scores: Record<string, TeamScore>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(getStorageKey(judge), JSON.stringify(scores))
}

function getTotal(score: TeamScore): number {
  return (
    (score.score_impact ?? 0) +
    (score.score_technical ?? 0)
  )
}

export default function JudgePage() {
  const supabase = useMemo(() => createClient(), [])
  const [selectedJudge, setSelectedJudge] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [scores, setScores] = useState<Record<string, TeamScore>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [dbAvailable, setDbAvailable] = useState(false)
  const [showAllGroups, setShowAllGroups] = useState(false)

  // Load teams from Supabase
  useEffect(() => {
    async function loadTeams() {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('region', 'KR')
        .order('name')
      if (data) setTeams(data)
      setLoading(false)
    }
    loadTeams()
  }, [supabase])

  // Check if judging_scores table exists and load from DB
  useEffect(() => {
    if (!selectedJudge) return
    async function loadFromDb() {
      const { data, error } = await supabase
        .from('judging_scores' as never)
        .select('*')
        .eq('judge_name', selectedJudge!)
      if (!error && data) {
        setDbAvailable(true)
        const dbScores: Record<string, TeamScore> = {}
        for (const row of data as Array<{
          team_id: string
          score_creativity: number | null
          score_technical: number | null
          score_impact: number | null
          score_presentation: number | null
          comment: string | null
        }>) {
          dbScores[row.team_id] = {
            score_creativity: row.score_creativity,
            score_technical: row.score_technical,
            score_impact: row.score_impact,
            score_presentation: row.score_presentation,
            comment: row.comment ?? '',
          }
        }
        // Merge: DB takes priority, then localStorage
        const localScores = loadScoresFromStorage(selectedJudge!)
        setScores({ ...localScores, ...dbScores })
      } else {
        // DB not available, use localStorage only
        setScores(loadScoresFromStorage(selectedJudge!))
      }
    }
    loadFromDb()
  }, [selectedJudge, supabase])

  // Check URL params for judge preselection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const judge = params.get('judge')
    if (judge && JUDGE_GROUPS.some((g) => g.judge === judge)) {
      setSelectedJudge(judge)
    }
  }, [])

  const updateScore = useCallback(
    (teamId: string, key: CriteriaKey, value: number | null) => {
      setScores((prev) => {
        const existing = prev[teamId] ?? {
          score_creativity: null,
          score_technical: null,
          score_impact: null,
          score_presentation: null,
          comment: '',
        }
        const updated = { ...prev, [teamId]: { ...existing, [key]: value } }
        if (selectedJudge) saveScoresToStorage(selectedJudge, updated)
        return updated
      })
    },
    [selectedJudge]
  )

  const updateComment = useCallback(
    (teamId: string, comment: string) => {
      setScores((prev) => {
        const existing = prev[teamId] ?? {
          score_creativity: null,
          score_technical: null,
          score_impact: null,
          score_presentation: null,
          comment: '',
        }
        const updated = { ...prev, [teamId]: { ...existing, comment } }
        if (selectedJudge) saveScoresToStorage(selectedJudge, updated)
        return updated
      })
    },
    [selectedJudge]
  )

  const saveToDb = useCallback(
    async (teamId: string) => {
      if (!selectedJudge || !dbAvailable) return
      setSaving(teamId)
      const score = scores[teamId]
      if (!score) {
        setSaving(null)
        return
      }
      const payload = {
        team_id: teamId,
        judge_name: selectedJudge,
        score_creativity: score.score_creativity,
        score_technical: score.score_technical,
        score_impact: score.score_impact,
        score_presentation: score.score_presentation,
        comment: score.comment || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('judging_scores' as never)
        .upsert(payload as never, { onConflict: 'team_id,judge_name' })

      if (error) {
        console.error('Save error:', error)
      }
      setSaving(null)
    },
    [selectedJudge, dbAvailable, scores, supabase]
  )

  const saveAll = useCallback(async () => {
    if (!selectedJudge) return
    const group = JUDGE_GROUPS.find((g) => g.judge === selectedJudge)
    if (!group) return
    for (const teamId of group.teamIds) {
      if (scores[teamId]) {
        await saveToDb(teamId)
      }
    }
  }, [selectedJudge, scores, saveToDb])

  const getTeam = (id: string) => teams.find((t) => t.id === id)

  // Judge selection screen
  if (!selectedJudge) {
    return (
      <div className="min-h-screen grid-bg grain-overlay flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h1
            className="font-display text-5xl md:text-7xl text-center mb-2 text-glow-yellow"
            style={{ color: '#FFD90F' }}
          >
            RALPHTHON
          </h1>
          <p className="text-center text-lg mb-2" style={{ color: '#8892b0' }}>
            Seoul Hackathon Judging
          </p>
          <p className="text-center text-sm mb-10" style={{ color: '#E63946' }}>
            Final 5 Teams (1+1+2+1)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JUDGE_GROUPS.map((group, idx) => (
              <button
                key={group.judge}
                onClick={() => setSelectedJudge(group.judge)}
                className="glass-card rounded-xl p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-2xl font-display"
                    style={{ color: '#FFD90F' }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xl font-bold" style={{ color: '#e2e8f0' }}>
                    {group.judge}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#8892b0' }}>
                    {group.teamIds.length}팀 심사
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: group.picks >= 2 ? 'rgba(230,57,70,0.2)' : 'rgba(69,182,73,0.2)',
                      color: group.picks >= 2 ? '#E63946' : '#45B649',
                    }}
                  >
                    {group.picks}팀 선발
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {group.teamIds.slice(0, 4).map((id) => {
                    const team = teams.find((t) => t.id === id)
                    return (
                      <span
                        key={id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(255,217,15,0.1)',
                          color: '#FFD90F',
                        }}
                      >
                        {team?.name ?? '...'}
                      </span>
                    )
                  })}
                  {group.teamIds.length > 4 && (
                    <span
                      className="text-xs px-2 py-0.5"
                      style={{ color: '#8892b0' }}
                    >
                      +{group.teamIds.length - 4}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* All groups overview button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAllGroups(true)}
              className="text-sm underline"
              style={{ color: '#8892b0' }}
            >
              전체 그룹 한눈에 보기
            </button>
          </div>

          {showAllGroups && (
            <AllGroupsOverview
              teams={teams}
              scores={scores}
              onClose={() => setShowAllGroups(false)}
            />
          )}
        </div>
      </div>
    )
  }

  const currentGroup = JUDGE_GROUPS.find((g) => g.judge === selectedJudge)!
  const groupTeams = currentGroup.teamIds
    .map((id) => getTeam(id))
    .filter((t): t is Team => t !== undefined)

  if (loading) {
    return (
      <div className="min-h-screen grid-bg grain-overlay flex items-center justify-center">
        <div className="text-xl" style={{ color: '#FFD90F' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg grain-overlay">
      {/* Header */}
      <div
        className="sticky top-0 z-30 glass border-b"
        style={{ borderColor: 'rgba(255,217,15,0.15)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedJudge(null)}
              className="text-sm px-3 py-1 rounded-lg transition-colors"
              style={{
                background: 'rgba(255,217,15,0.1)',
                color: '#FFD90F',
              }}
            >
              ← 돌아가기
            </button>
            <h1 className="font-display text-2xl" style={{ color: '#FFD90F' }}>
              {selectedJudge}
            </h1>
            <span className="text-sm" style={{ color: '#8892b0' }}>
              {groupTeams.length}팀
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                background: currentGroup.picks >= 2 ? 'rgba(230,57,70,0.2)' : 'rgba(69,182,73,0.2)',
                color: currentGroup.picks >= 2 ? '#E63946' : '#45B649',
              }}
            >
              {currentGroup.picks}팀 선발
            </span>
          </div>
          <div className="flex items-center gap-2">
            {dbAvailable && (
              <button
                onClick={saveAll}
                className="text-sm px-4 py-2 rounded-lg font-bold transition-all active:scale-95"
                style={{
                  background: '#FFD90F',
                  color: '#0a0a1a',
                }}
              >
                전체 저장
              </button>
            )}
            {!dbAvailable && (
              <span
                className="text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(230,57,70,0.2)', color: '#E63946' }}
              >
                로컬 저장만 가능
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Team Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {groupTeams.map((team, idx) => {
          const teamScore = scores[team.id] ?? {
            score_creativity: null,
            score_technical: null,
            score_impact: null,
            score_presentation: null,
            comment: '',
          }
          const total = getTotal(teamScore)
          const isSaving = saving === team.id

          return (
            <div
              key={team.id}
              className="glass-card rounded-xl overflow-hidden"
              style={{
                animation: `fadeInUp 0.4s ease ${idx * 0.05}s both`,
              }}
            >
              {/* Team Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{
                  borderBottom: '1px solid rgba(255,217,15,0.08)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-display text-2xl w-8 text-center"
                    style={{ color: '#FFD90F' }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h2
                      className="text-lg font-bold"
                      style={{ color: '#e2e8f0' }}
                    >
                      {team.name}
                    </h2>
                    {team.project_desc && (
                      <p
                        className="text-xs mt-0.5 line-clamp-2 max-w-md"
                        style={{ color: '#8892b0' }}
                      >
                        {team.project_desc}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Lobster Count */}
                  <div className="flex items-center gap-1.5" title="Lobster 사용 횟수">
                    <span className="text-xl">🦞</span>
                    <span
                      className="font-display text-xl"
                      style={{
                        color:
                          team.lobster_count > 0 ? '#E63946' : '#8892b0',
                      }}
                    >
                      {team.lobster_count}
                    </span>
                  </div>
                  {/* Total Score */}
                  <div
                    className="text-right px-3 py-1 rounded-lg"
                    style={{
                      background:
                        total > 0
                          ? 'rgba(255,217,15,0.15)'
                          : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      className="text-xs"
                      style={{ color: '#8892b0' }}
                    >
                      합계
                    </div>
                    <div
                      className="font-display text-2xl"
                      style={{
                        color: total > 0 ? '#FFD90F' : '#8892b0',
                      }}
                    >
                      {total}
                      <span className="text-sm" style={{ color: '#8892b0' }}>
                        /20
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scoring Grid */}
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {CRITERIA.map((c) => (
                    <ScoreInput
                      key={c.key}
                      label={c.label}
                      emoji={c.emoji}
                      value={teamScore[c.key] as number | null}
                      onChange={(v) => updateScore(team.id, c.key, v)}
                    />
                  ))}
                </div>
                {/* Comment */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="코멘트 (선택)"
                    value={teamScore.comment ?? ''}
                    onChange={(e) => updateComment(team.id, e.target.value)}
                    className="flex-1 text-sm px-3 py-2 rounded-lg border-0"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#e2e8f0',
                    }}
                  />
                  {dbAvailable && (
                    <button
                      onClick={() => saveToDb(team.id)}
                      disabled={isSaving}
                      className="text-xs px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        background: 'rgba(69,182,73,0.2)',
                        color: '#45B649',
                      }}
                    >
                      {isSaving ? '...' : '저장'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div
        className="sticky bottom-0 z-30 glass border-t"
        style={{ borderColor: 'rgba(255,217,15,0.15)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto">
            {groupTeams.map((team, idx) => {
              const teamScore = scores[team.id]
              const total = teamScore ? getTotal(teamScore) : 0
              const hasScore = total > 0
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-1.5 shrink-0"
                >
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: hasScore ? '#FFD90F' : '#8892b0',
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: hasScore ? '#e2e8f0' : '#8892b0',
                    }}
                  >
                    {total}/20
                  </span>
                </div>
              )
            })}
          </div>
          <div className="text-sm shrink-0" style={{ color: '#8892b0' }}>
            완료:{' '}
            {
              groupTeams.filter((t) => {
                const s = scores[t.id]
                return s && getTotal(s) > 0
              }).length
            }
            /{groupTeams.length}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreInput({
  label,
  emoji,
  value,
  onChange,
}: {
  label: string
  emoji: string
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs font-medium" style={{ color: '#8892b0' }}>
          {label}
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(value === n ? null : n)}
            className="w-7 h-7 rounded text-xs font-bold transition-all active:scale-90"
            style={{
              background:
                value === n
                  ? '#FFD90F'
                  : 'rgba(255,255,255,0.06)',
              color: value === n ? '#0a0a1a' : '#8892b0',
              boxShadow:
                value === n
                  ? '0 0 12px rgba(255,217,15,0.3)'
                  : 'none',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function AllGroupsOverview({
  teams,
  scores,
  onClose,
}: {
  teams: Team[]
  scores: Record<string, TeamScore>
  onClose: () => void
}) {
  const getTeam = (id: string) => teams.find((t) => t.id === id)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="glass-card rounded-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display text-3xl"
            style={{ color: '#FFD90F' }}
          >
            전체 심사 현황
          </h2>
          <button
            onClick={onClose}
            className="text-xl px-3 py-1"
            style={{ color: '#8892b0' }}
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {JUDGE_GROUPS.map((group, gIdx) => (
            <div key={group.judge}>
              <h3
                className="font-display text-xl mb-3"
                style={{ color: '#FFD90F' }}
              >
                {gIdx + 1}. {group.judge}{' '}
                <span
                  className="text-sm"
                  style={{ color: group.picks >= 2 ? '#E63946' : '#45B649' }}
                >
                  ({group.picks}팀 선발)
                </span>
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: '#8892b0' }}>
                    <th className="text-left py-1 font-normal">팀</th>
                    <th className="text-center py-1 font-normal w-10">🦞</th>
                    <th className="text-right py-1 font-normal w-16">점수</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teamIds.map((id) => {
                    const team = getTeam(id)
                    const s = scores[id]
                    const total = s ? getTotal(s) : 0
                    return (
                      <tr
                        key={id}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <td
                          className="py-1.5"
                          style={{ color: '#e2e8f0' }}
                        >
                          {team?.name ?? id.slice(0, 8)}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            color:
                              (team?.lobster_count ?? 0) > 0
                                ? '#E63946'
                                : '#8892b0',
                          }}
                        >
                          {team?.lobster_count ?? 0}
                        </td>
                        <td
                          className="text-right font-bold"
                          style={{
                            color: total > 0 ? '#FFD90F' : '#8892b0',
                          }}
                        >
                          {total > 0 ? `${total}/20` : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
