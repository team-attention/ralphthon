import { useEffect, useState } from 'react'

const LOBSTER_DURATION_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Returns remaining seconds for a lobster activation.
 * Returns 0 when inactive or expired.
 */
export function useLobsterCountdown(lobsterActivatedAt: string | null): number {
  const [remaining, setRemaining] = useState(() => calcRemaining(lobsterActivatedAt))

  useEffect(() => {
    setRemaining(calcRemaining(lobsterActivatedAt))

    if (!lobsterActivatedAt) return

    const interval = setInterval(() => {
      const r = calcRemaining(lobsterActivatedAt)
      setRemaining(r)
      if (r <= 0) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [lobsterActivatedAt])

  return remaining
}

function calcRemaining(activatedAt: string | null): number {
  if (!activatedAt) return 0
  const elapsed = Date.now() - new Date(activatedAt).getTime()
  const remaining = LOBSTER_DURATION_MS - elapsed
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

/**
 * Format seconds as MM:SS
 */
export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
