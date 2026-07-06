import { notImplemented } from "./not-implemented"

export interface OrgRepo {
    get(orgId: string): Promise<unknown>
    create(input: unknown): Promise<unknown>
}

export const orgRepo: OrgRepo = {
    get: () => notImplemented("orgRepo.get"),
    create: () => notImplemented("orgRepo.create")
}

export interface ReservationRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const reservationRepo: ReservationRepo = {
    list: () => notImplemented("reservationRepo.list"),
    create: () => notImplemented("reservationRepo.create"),
}

export interface CustomerRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const customerRepo: CustomerRepo = {
    list: () => notImplemented("customerRepo.list"),
    create: () => notImplemented("customerRepo.create")
}

export interface ResourceRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const resourceRepo: ResourceRepo = {
    list: () => notImplemented("resourceRepo.list"),
    create: () => notImplemented("resourceRepo.create")
}

export interface MemberRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const memberRepo: MemberRepo = {
    list: () => notImplemented("memberRepo.list"),
    create: () => notImplemented("memberRepo.create")
}

export interface NotificationRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const notificationRepo: NotificationRepo = {
    list: () => notImplemented("notificationRepo.list"),
    create: () => notImplemented("notificationRepo.create")
}

export interface AuditlogRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const auditlogRepo: AuditlogRepo = {
    list: () => notImplemented("auditlogRepo.list"),
    create: () => notImplemented("auditlogRepo.create")
}