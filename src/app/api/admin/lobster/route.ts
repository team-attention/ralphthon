import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  // Authenticate the user via Supabase session cookies
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No cookies to set in this POST handler
        },
      },
    }
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is an admin (supports exact emails and @domain patterns)
  const adminPatterns = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const email = user.email?.toLowerCase() ?? ''
  const isAdmin = adminPatterns.some((pattern) =>
    pattern.startsWith('@')
      ? email.endsWith(pattern)
      : email === pattern
  )

  if (!email || !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  return NextResponse.json({ success: true })
}
