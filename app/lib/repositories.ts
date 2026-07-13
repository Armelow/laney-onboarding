import { notImplemented } from "./not-implemented"
import { supabase } from "./supabase"

export interface OrgRepo {
    get(orgId: string): Promise<unknown>
    create(input: unknown): Promise<unknown>
}

export const orgRepo: OrgRepo = {
    get: () => notImplemented("orgRepo.get"),
    create: () => notImplemented("orgRepo.create")
}

export type NewReservation = {
    org_id: string
    member_id: string
    customer_id: string
    resource_id: string
    starts_at: string
    ends_at: string
}

export interface ReservationRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: NewReservation): Promise<unknown>
}

export const reservationRepo: ReservationRepo = {
    list: async (orgId: string) => {
        const {data, error } = await supabase 
            .from ("reservation")
            .select("id, starts_at, status, customer:customer_id(name), resource:resource_id(name)")
            .eq("org_id", orgId)
            .order("starts_at")
        
        if (error) throw new Error(error.message)

        return data
    },

    create: async (input: NewReservation) => {
        const { data, error } = await supabase
            .from("reservation")
            .insert({
                org_id: input.org_id,
                member_id: input.member_id,
                customer_id: input.customer_id,
                resource_id: input.resource_id,
                starts_at: input.starts_at,
                ends_at: input.ends_at,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        return data
    }
}

export interface CustomerRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const customerRepo: CustomerRepo = {
    list: async (orgId: string) => {
        const { data, error } = await supabase
            .from("customer")
            .select("id, name, phone")
            .eq("org_id", orgId)
            .order("name")

        if (error) throw new Error(error.message)

        return data
    },
    create: () => notImplemented("customerRepo.create")
}

export interface ResourceRepo {
    list(orgId: string): Promise<unknown[]>
    create(input: unknown): Promise<unknown>
}

export const resourceRepo: ResourceRepo = {
    list: async (orgId: string) => {
        const { data, error } = await supabase
            .from("resource")
            .select("id, name")
            .eq("org_id", orgId)
            .order("name")

        if(error) throw new Error(error.message)

        return data
},
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
