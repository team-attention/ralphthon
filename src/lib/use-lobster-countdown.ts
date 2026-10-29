import { useEffect, useState } from 'react'

export const LOBSTER_DURATION_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Milliseconds left in a lobster activation window, 0 when inactive or expired.
 */
export function getLobsterRemainingMs(lobsterActivatedAt: string | null): number {
  if (!lobsterActivatedAt) return 0
  const elapsed = Date.now() - new Date(lobsterActivatedAt).getTime()
  const remaining = LOBSTER_DURATION_MS - elapsed
  return remaining > 0 ? remaining : 0
}

/**
 * Returns remaining seconds for a lobster activation.
 * Returns 0 when inactive or expired.
 */
export function useLobsterCountdown(lobsterActivatedAt: string | null): number {
  const [remaining, setRemaining] = useState(() => calcRemaining(lobsterActivatedAt))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const remaining = getLobsterRemainingMs(activatedAt)
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
