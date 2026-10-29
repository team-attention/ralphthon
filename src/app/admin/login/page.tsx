'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin-emails'
import { GoogleIcon } from '@/components/google-icon'

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
        const email = user.email.toLowerCase()
        const isAdmin = isAdminEmail(email, process.env.NEXT_PUBLIC_ADMIN_EMAILS)

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
          <GoogleIcon />
          {t('signInWithGoogle')}
        </button>
      </div>
    </div>
  )
}
