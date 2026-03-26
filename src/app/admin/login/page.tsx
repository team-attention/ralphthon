'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'

export default function AdminLoginPage() {
  const t = useTranslations('adminLogin')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        // Already logged in — check if admin
        const adminPatterns = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)

        const email = user.email.toLowerCase()
        const isAdmin = adminPatterns.some((pattern) =>
          pattern.startsWith('@')
            ? email.endsWith(pattern)
            : email === pattern
        )

        if (isAdmin) {
          router.replace('/admin')
          return
        } else {
          setError(t('notAdmin'))
        }
      }
      setChecking(false)
    })
  }, [router, supabase, t])

  async function handleGoogleLogin() {
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=/admin`,
      },
    })
  }

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('checking')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8">
        <h1 className="mb-2 text-2xl font-bold">{t('title')}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t('subtitle')}</p>

        {error && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm"
            style={{
              background: 'rgba(230, 57, 70, 0.1)',
              border: '1px solid rgba(230, 57, 70, 0.3)',
              color: '#E63946',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('signInWithGoogle')}
        </button>
      </div>
    </div>
  )
}
