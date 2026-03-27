import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

// Parse .env.local manually to avoid dotenv dependency
function loadEnvLocal(): Record<string, string> {
  const envPath = resolve(__dirname, '..', '.env.local')
  const content = readFileSync(envPath, 'utf-8')
  const env: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const CSV_COLUMNS = [
  'id',
  'name',
  'region',
  'leader_email',
  'member_count',
  'project_desc',
  'github_url',
  'demo_video_url',
  'lobster_count',
] as const

const UTF8_BOM = '\uFEFF'

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsvRow(values: unknown[]): string {
  return values.map(escapeCsvValue).join(',')
}

async function main() {
  const env = loadEnvLocal()
  const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
  const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY']

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Fetch all teams
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, region, leader_email, project_desc, github_url, demo_video_url, lobster_count')

  if (teamsError) {
    console.error('Failed to fetch teams:', teamsError.message)
    process.exit(1)
  }

  if (!teams || teams.length === 0) {
    console.log('No teams found.')
    return
  }

  // Fetch member counts per team
  const { data: memberCounts, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')

  if (memberError) {
    console.error('Failed to fetch team_members:', memberError.message)
    process.exit(1)
  }

  // Count members per team_id
  const countMap: Record<string, number> = {}
  for (const row of memberCounts || []) {
    countMap[row.team_id] = (countMap[row.team_id] || 0) + 1
  }

  // Build rows with member_count
  const enrichedTeams = teams.map((team) => ({
    ...team,
    member_count: countMap[team.id] || 0,
  }))

  // Split by region
  const krTeams = enrichedTeams.filter((t) => t.region === 'KR')
  const usTeams = enrichedTeams.filter((t) => t.region === 'US')

  const exportsDir = resolve(__dirname, '..', 'exports')
  mkdirSync(exportsDir, { recursive: true })

  const header = toCsvRow(CSV_COLUMNS as unknown as string[])

  for (const [filename, regionTeams] of [
    ['kr_teams.csv', krTeams],
    ['us_teams.csv', usTeams],
  ] as const) {
    const rows = regionTeams.map((team) =>
      toCsvRow(CSV_COLUMNS.map((col) => {
        const value = (team as Record<string, unknown>)[col]
        return value === null || value === undefined ? '' : value
      }))
    )

    const csvContent = UTF8_BOM + [header, ...rows].join('\n') + '\n'
    const filePath = resolve(exportsDir, filename)
    writeFileSync(filePath, csvContent, 'utf-8')
    console.log(`Wrote ${filePath} (${regionTeams.length} teams)`)
  }

  console.log('Export complete.')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
