import { NextRequest, NextResponse } from 'next/server'
import { adminSessionError } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const authResponse = await adminSessionError()
  if (authResponse) return authResponse

  const body = await request.json()
  const { teamId } = body as { teamId: string }

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Atomically: activate lobster, reset request, increment count
  const { error } = await admin.rpc('activate_lobster' as never, { team_id_input: teamId } as never)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log the event for the timeline
  const { data: team } = await admin.from('teams').select('name, region').eq('id', teamId).single() as { data: { name: string; region: string } | null }
  if (team) {
    const { error: eventError } = await admin.from('lobster_events' as never).insert({
      team_id: teamId,
      team_name: team.name,
      region: team.region,
    } as never)
    if (eventError) {
      console.error('[lobster] Failed to log timeline event:', eventError.message)
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const authResponse = await adminSessionError()
  if (authResponse) return authResponse

  const body = await request.json()
  const { teamId } = body as { teamId: string }

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('teams')
    .update({ lobster_requested: false } as never)
    .eq('id', teamId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
