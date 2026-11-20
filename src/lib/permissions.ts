/**
 * Whether the signed-in user has `permission` (see `permissionsFromRole`). The UI hides what the server would
 * refuse; the server checks with `requirePermission()` either way.
 */
export function can(session: { permissions: string[] } | null | undefined, permission: string): boolean {
    return !!session?.permissions.includes(permission);
}
