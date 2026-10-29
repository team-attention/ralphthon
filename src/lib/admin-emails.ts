/**
 * Admin allow-list matcher shared by route handlers and admin pages.
 * `adminEmails` is a comma-separated list of exact emails or `@domain` suffixes.
 * Callers pass the env var themselves: route handlers use ADMIN_EMAILS, client
 * pages must reference process.env.NEXT_PUBLIC_ADMIN_EMAILS literally so Next
 * inlines it. `email` must already be lower-cased.
 */
export function isAdminEmail(email: string, adminEmails: string | undefined): boolean {
  const adminPatterns = (adminEmails ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  return adminPatterns.some((pattern) =>
    pattern.startsWith('@')
      ? email.endsWith(pattern)
      : email === pattern
  )
}
