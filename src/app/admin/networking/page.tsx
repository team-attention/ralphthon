'use client'

import { useEffect, useState } from 'react'

type NetworkingStatus = {
  generated_at: string
  totals: {
    teams: number
    participants: number
    opt_in: number
    discord_linked: number
    missing_discord: number
    invalid_discord: number
    networking_ready: number
    duplicate_emails: number
    missing_team: number
  }
  by_region: Record<string, {
    teams: number
    participants: number
    networking_ready: number
  }>
  gates: Record<string, boolean>
  links: {
    export: string
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

function Gate({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className={`rounded-lg border p-4 ${ok ? 'border-emerald-500/40' : 'border-amber-500/50'}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{label}</p>
        <span className={ok ? 'text-emerald-500' : 'text-amber-500'}>{ok ? 'Ready' : 'Check'}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

export default function AdminNetworkingPage() {
  const [status, setStatus] = useState<NetworkingStatus | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/networking-status', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [])

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Networking</h1>
        <p className="mt-4 rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!status) {
    return <div className="p-6 text-sm text-muted-foreground">Loading networking status...</div>
  }

  const t = status.totals
  const exportHref = status.links.export

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ralphthon source of truth</p>
          <h1 className="text-3xl font-semibold tracking-tight">Networking readiness</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            DB 기준 참가자, Discord reachability, export 가능 여부를 확인합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <a className="rounded-md border px-3 py-2 text-sm font-medium" href={exportHref} target="_blank" rel="noreferrer">
            Export participants
          </a>
          <a className="rounded-md border px-3 py-2 text-sm font-medium" href="https://ralph-net.vercel.app/web/admin" target="_blank" rel="noreferrer">
            Engine backoffice
          </a>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Teams" value={t.teams} />
        <Stat label="Participants" value={t.participants} />
        <Stat label="Discord linked" value={t.discord_linked} />
        <Stat label="Networking ready" value={t.networking_ready} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Gate label="Export" ok={status.gates.export_ready} detail={`${t.duplicate_emails} duplicate emails, ${t.missing_team} missing-team members`} />
        <Gate label="Invite/DM" ok={status.gates.invite_ready} detail={`${t.opt_in} opted in, ${t.missing_discord} missing Discord`} />
        <Gate label="Start networking" ok={status.gates.networking_ready} detail={`${t.networking_ready} ready, ${t.invalid_discord} invalid Discord IDs`} />
      </section>

      <section className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">By region</h2>
          <span className="text-xs text-muted-foreground">{new Date(status.generated_at).toLocaleString()}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(status.by_region).map(([region, row]) => (
            <div key={region} className="rounded-md border p-3">
              <p className="font-medium">{region}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {row.teams} teams · {row.participants} participants · {row.networking_ready} ready
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
