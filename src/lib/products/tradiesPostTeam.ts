// KIT SHIM - social roles come from users.role/permissions written by provisionSocialIdentity
// (host owner -> 'owner', host admin -> 'team_member' + full permissions, member -> 'team_member').
type Permissions = Partial<Record<string, boolean>> | null | undefined

function isFullAccess(permissions: Permissions): boolean {
  if (!permissions) return false
  return Boolean(
    permissions.can_send_quotes &&
      permissions.can_mark_job_done &&
      permissions.can_upload_photos &&
      permissions.can_send_invoices &&
      permissions.can_view_crm,
  )
}

function canManage(role: string | null | undefined, permissions?: Permissions): boolean {
  if (role === 'owner' || role === 'super_admin') return true
  return role === 'team_member' && isFullAccess(permissions)
}

export function canEditTradiesPostBrand(role: string | null | undefined, permissions?: Permissions): boolean {
  return canManage(role, permissions)
}

export function canManageTradiesPostConnections(role: string | null | undefined, permissions?: Permissions): boolean {
  return canManage(role, permissions)
}
