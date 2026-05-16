import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

type TeamRow = {
  id: string
  region: 'KR' | 'US'
}

type TeamMemberRow = {
  id: string
  team_id: string
  email: string
  discord_user_id: string | null
  discord_username: string | null
  networking_delivery_opt_in: boolean | null
}

const DISCORD_SNOWFLAKE_RE = /^\d{15,25}$/
const BACKOFFICE_ORIGIN = process.env.NETWORKING_BACKOFFICE_ORIGIN ?? 'https://ralph-net.vercel.app'

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set('Access-Control-Allow-Origin', BACKOFFICE_ORIGIN)
  headers.set('Access-Control-Allow-Credentials', 'true')
  return NextResponse.json(data, { ...init, headers })
}

function isAdminEmail(email: string) {
  const adminPatterns = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  return adminPatterns.some((pattern) =>
    pattern.startsWith('@')
      ? email.endsWith(pattern)
      : email === pattern
  )
}

function hasBackofficeToken(request: NextRequest) {
  const expected = process.env.NETWORKING_BACKOFFICE_TOKEN || process.env.RALPHTHON_BACKOFFICE_TOKEN
  if (!expected) return false
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const header = request.headers.get('x-networking-backoffice-token')
  return bearer === expected || header === expected
}

async function hasAdminSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return false
  }

  const email = user.email?.toLowerCase() ?? ''
  return Boolean(email && isAdminEmail(email))
}

export async function GET(request: NextRequest) {
  if (!hasBackofficeToken(request) && !(await hasAdminSession())) {
    return json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const [teamsRes, membersRes] = await Promise.all([
    admin.from('teams').select('id,region'),
    admin
      .from('team_members')
      .select('id,team_id,email,discord_user_id,discord_username,networking_delivery_opt_in'),
  ])

  if (teamsRes.error) {
    return json({ error: teamsRes.error.message }, { status: 500 })
  }

  if (membersRes.error) {
    return json({ error: membersRes.error.message }, { status: 500 })
  }

  const teams = (teamsRes.data ?? []) as TeamRow[]
  const members = (membersRes.data ?? []) as TeamMemberRow[]
  const teamsById = new Map(teams.map((team) => [team.id, team]))
  const emailCounts = new Map<string, number>()
  const byRegion = {
    KR: { teams: 0, participants: 0, networking_ready: 0 },
    US: { teams: 0, participants: 0, networking_ready: 0 },
  }

  for (const team of teams) {
    byRegion[team.region].teams += 1
  }

  let optInCount = 0
  let discordLinkedCount = 0
  let invalidDiscordCount = 0
  let networkingReadyCount = 0
  let missingTeamCount = 0

  for (const member of members) {
    const normalizedEmail = member.email.trim().toLowerCase()
    emailCounts.set(normalizedEmail, (emailCounts.get(normalizedEmail) ?? 0) + 1)

    const optIn = member.networking_delivery_opt_in ?? true
    const hasDiscord = Boolean(member.discord_user_id || member.discord_username)
    const validDiscord = member.discord_user_id ? DISCORD_SNOWFLAKE_RE.test(member.discord_user_id) : Boolean(member.discord_username)
    const team = teamsById.get(member.team_id)

    if (!team) {
      missingTeamCount += 1
      continue
    }

    byRegion[team.region].participants += 1
    if (optIn) optInCount += 1
    if (hasDiscord) discordLinkedCount += 1
    if (hasDiscord && !validDiscord) invalidDiscordCount += 1
    if (optIn && hasDiscord && validDiscord) {
      networkingReadyCount += 1
      byRegion[team.region].networking_ready += 1
    }
  }

  const duplicateEmailCount = [...emailCounts.values()].filter((count) => count > 1).length
  const missingDiscordCount = members.length - discordLinkedCount

  return json({
    schema_version: 'ralphthon_networking_status_v1',
    generated_at: new Date().toISOString(),
    totals: {
      teams: teams.length,
      participants: members.length,
      opt_in: optInCount,
      discord_linked: discordLinkedCount,
      missing_discord: missingDiscordCount,
      invalid_discord: invalidDiscordCount,
      networking_ready: networkingReadyCount,
      duplicate_emails: duplicateEmailCount,
      missing_team: missingTeamCount,
    },
    by_region: byRegion,
    gates: {
      export_ready: members.length > 0 && duplicateEmailCount === 0,
      invite_ready: optInCount > 0,
      networking_ready: networkingReadyCount > 0 && invalidDiscordCount === 0,
    },
    links: {
      export: '/api/admin/networking-export?event_slug=ralphthon-sg',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': BACKOFFICE_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-networking-backoffice-token',
    },
  })
}
