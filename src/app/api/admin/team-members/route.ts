import { NextRequest, NextResponse } from 'next/server'
import { adminSessionError } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
  }

  const authResponse = await adminSessionError()
  if (authResponse) return authResponse

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .order('role', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ members: data })
}
