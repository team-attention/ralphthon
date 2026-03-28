'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/locale-switcher'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('common')

  return (
    <div className="flex min-h-screen flex-col">
      <nav id="admin-nav" className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">
            {t('ralphthon')} Admin
          </Link>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t('dashboard')}
          </Link>
          <Link
            href="/admin/guide"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Guide
          </Link>
          <Link
            href="/support"
            className="text-sm text-muted-foreground hover:text-foreground"
            target="_blank"
          >
            Sponsor
          </Link>
        </div>
        <LocaleSwitcher />
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
