import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { NETWORKING_COLUMNS, isMissingNetworkingColumn, isNetworkingRequestAuthorized } from '@/lib/networking'

type TeamRow = {
  id: string
  name: string
  region: 'KR' | 'US' | 'SG' | 'BUSAN'
}

type TeamMemberRow = {
  id: string
  team_id: string
  name: string | null
  email: string
  role: 'leader' | 'member'
  discord_user_id?: string | null
  discord_username?: string | null
  networking_delivery_opt_in?: boolean | null
}

type ParticipantExport = {
  team_member_id: string
  team_id: string
  team_name: string
  region: 'KR' | 'US' | 'SG' | 'BUSAN'
  role: 'leader' | 'member'
  name: string | null
  email_normalized: string
  discord_user_id?: string
  discord_username?: string
  delivery_opt_in: boolean
}

export async function GET(request: NextRequest) {
  if (!(await isNetworkingRequestAuthorized(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const eventSlug = request.nextUrl.searchParams.get('event_slug') ?? 'ralphthon'
  const exportedAt = new Date().toISOString()
  const exportRunId = crypto.randomUUID()
  const admin = createAdminClient()

  const [teamsRes, extendedMembersRes] = await Promise.all([
    admin
      .from('teams')
      .select('id,name,region')
      .order('name', { ascending: true }),
    admin
      .from('team_members')
      .select(`id,team_id,name,email,role,${NETWORKING_COLUMNS}`)
      .order('created_at', { ascending: true }),
  ])

  if (teamsRes.error) {
    return NextResponse.json({ error: teamsRes.error.message }, { status: 500 })
  }

  let membersRes = extendedMembersRes
  let hasNetworkingColumns = true

  if (extendedMembersRes.error && isMissingNetworkingColumn(extendedMembersRes.error.message)) {
    hasNetworkingColumns = false
    membersRes = await admin
      .from('team_members')
      .select('id,team_id,name,email,role')
      .order('created_at', { ascending: true })
  }

  if (membersRes.error) {
    return NextResponse.json({ error: membersRes.error.message }, { status: 500 })
  }

  const teams = (teamsRes.data ?? []) as TeamRow[]
  const members = (membersRes.data ?? []) as TeamMemberRow[]
  const teamsById = new Map(teams.map((team) => [team.id, team]))

  const participants = members.flatMap<ParticipantExport>((member) => {
    const team = teamsById.get(member.team_id)
    if (!team) {
      return []
    }

    const participant: ParticipantExport = {
      team_member_id: member.id,
      team_id: member.team_id,
      team_name: team.name,
      region: team.region,
      role: member.role,
      name: member.name,
      email_normalized: member.email.trim().toLowerCase(),
      delivery_opt_in: member.networking_delivery_opt_in ?? true,
    }

    if (member.discord_user_id) {
      participant.discord_user_id = member.discord_user_id
    }

    if (member.discord_username) {
      participant.discord_username = member.discord_username
    }

    return [participant]
  })

  return NextResponse.json({
    schema_version: 'ralphthon_participants_export_v1',
    event_slug: eventSlug,
    export_run_id: exportRunId,
    exported_at: exportedAt,
    delivery_schema: {
      has_networking_columns: hasNetworkingColumns,
      required_columns: ['discord_user_id', 'discord_username', 'networking_delivery_opt_in'],
      warning: hasNetworkingColumns
        ? null
        : 'Production DB is missing networking delivery columns. Export contains participants but no Discord delivery addresses.',
    },
    participants,
  })
}
