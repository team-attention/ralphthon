import 'server-only'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isAdminEmail } from './admin-emails'

/** Supabase client bound to the request's auth cookies. It never writes cookies. */
export async function createSessionClient() {
  const cookieStore = await cookies()
  return createServerClient(
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
}

export type AdminSessionStatus = 'unauthenticated' | 'forbidden' | 'admin'

/** Checks the cookie session against ADMIN_EMAILS (exact emails or @domain patterns). */
export async function getAdminSessionStatus(): Promise<AdminSessionStatus> {
  const supabase = await createSessionClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return 'unauthenticated'
  }

  const email = user.email?.toLowerCase() ?? ''
  return email && isAdminEmail(email, process.env.ADMIN_EMAILS) ? 'admin' : 'forbidden'
}

/** 401 without a session, 403 for a non-admin, null for an admin. */
export async function adminSessionError(): Promise<NextResponse | null> {
  const status = await getAdminSessionStatus()
  if (status === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (status === 'forbidden') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}
