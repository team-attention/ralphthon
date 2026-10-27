import 'server-only'
import type { NextRequest } from 'next/server'
import { getAdminSessionStatus } from './admin-auth'

// Shared by /api/admin/networking-export and /api/admin/networking-status,
// which the external networking backoffice (ralph-net) calls.

export const NETWORKING_COLUMNS = 'discord_user_id,discord_username,networking_delivery_opt_in'

/** True when a team_members select failed because the networking migration is not applied. */
export function isMissingNetworkingColumn(message: string) {
  return ['discord_user_id', 'discord_username', 'networking_delivery_opt_in'].some((column) =>
    message.includes(column)
  )
}

function hasBackofficeToken(request: NextRequest) {
  const expected = process.env.NETWORKING_BACKOFFICE_TOKEN || process.env.RALPHTHON_BACKOFFICE_TOKEN
  if (!expected) return false
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const header = request.headers.get('x-networking-backoffice-token')
  return bearer === expected || header === expected
}

/** Backoffice token (checked first) or an admin cookie session. */
export async function isNetworkingRequestAuthorized(request: NextRequest) {
  return hasBackofficeToken(request) || (await getAdminSessionStatus()) === 'admin'
}
