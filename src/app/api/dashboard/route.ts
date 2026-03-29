import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createAdminClient()

  const [teamsRes, membersRes] = await Promise.all([
    supabase
      .from('teams')
      .select('id,name,github_url,lobster_count')
      .eq('region', 'KR')
      .neq('name', 'test-inkeun'),
    supabase.from('team_members').select('team_id'),
  ])

  const teams = teamsRes.data ?? []
  const members = membersRes.data ?? []

  const memberCount: Record<string, number> = {}
  for (const m of members) {
    memberCount[m.team_id] = (memberCount[m.team_id] || 0) + 1
  }

  const result = teams.map((t) => ({
    id: t.id,
    name: t.name,
    github_url: t.github_url,
    lobster_count: t.lobster_count,
    member_count: memberCount[t.id] || 0,
  }))

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  })
}
