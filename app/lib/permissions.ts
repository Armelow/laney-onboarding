export type AppRole = "owner" | "admin" | "staff" | "viewer"

export type AppPermission =
    | "reservation.create"
    | "reservation.delete"
    | "member.manage"

    const ROLE_PERMISSIONS: Array<{
        role: AppRole
        permission: AppPermission
    }> = [
        { role: "owner", permission: "reservation.create"},
        { role: "owner", permission: "reservation.delete"},
        { role: "owner", permission: "member.manage"},
        { role: "admin", permission: "reservation.create"},
        { role: "admin", permission: "reservation.delete"},
        { role: "staff", permission: "reservation.create"},
    ]

    export function hasPermission(
        role: AppRole,
        permission: AppPermission
    ): boolean {
        return ROLE_PERMISSIONS.some(
            (rolePermission) =>
                rolePermission.role === role &&
                rolePermission.permission === permission
        )
    }