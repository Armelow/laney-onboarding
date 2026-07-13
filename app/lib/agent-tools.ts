import { tool } from "ai"
import { z } from "zod"
import {
    customerRepo,
    resourceRepo,
    reservationRepo,
} from "./repositories"
import type { DbClient } from "./supabase"

export function createAgentTools(
    orgId: string,
    memberId: string,
    db: DbClient
) {
    return {
        findCustomer: tool({
            description: "현재 회사의 고객 이름으로 고객을 찾는다",

            inputSchema: z.object({
                name: z.string().min(1),
            }),

            execute: async ({ name }) => {
                const customers =
                    await customerRepo.list(orgId, db) as Array<{
                        id: string
                        name: string
                    }>

                const customer = customers.find(
                    (item) =>
                        item.name.trim().toLowerCase() ===
                    name.trim().toLowerCase()
                )

                if (!customer) {
                    return {
                        found: false,
                        message: `고객을 찾을 수 없습니다: ${name}`,
                    }
                }

                return {
                    found: true,
                    customer,
                }

            },
        }),

        findResource: tool({
            description: "현재 회사의 예약 대상 이름으로 예약 대상을 찾는다",

            inputSchema: z.object({
                name: z.string().min(1),
            }),

            execute: async ({ name }) => {
                const resources =
                    await resourceRepo.list(orgId, db) as Array<{
                        id: string
                        name: string
                    }>

                const resource = resources.find(
                    (item) =>
                        item.name.trim().toLowerCase() ===
                    name.trim().toLowerCase()
                )

                if (!resource) {
                    return {
                        found: false,
                        message: `예약 대상을 찾을 수 없습니다: ${name}`,
                    }
                }

                return {
                    found: true,
                    resource,
                }

            },
        }),

        createReservation: tool({
            description: "고객과 예약 대상이 확인된 뒤 예약을 만든다",

            inputSchema: z.object({
                customer_id: z.string().min(1),
                resource_id: z.string().min(1),
                starts_at: z.string().min(1),
            }),

            execute: async ({
                customer_id,
                resource_id,
                starts_at,
            }) => {
                const customers =
                await customerRepo.list(orgId, db) as Array<{
                    id: string
                }>

                if (!customers.some(
                    (customer) => customer.id === customer_id
                )) {
                    return {
                        ok: false,
                        message: "존재하지 않는 고객입니다.",
                    }
                }

                const resources =
                    await resourceRepo.list(orgId, db) as Array<{
                        id: string
                    }>

                if (!resources.some(
                    (resource) => resource.id === resource_id
                )) {
                    return {
                        ok: false,
                        message: "존재하지 않는 예약 대상입니다."
                    }
                }

                const startsAt = new Date(starts_at)

                if (Number.isNaN(startsAt.getTime())) {
                    return {
                        ok: false,
                        message: "올바르지 않은 시작 시각입니다.",
                    }
                }

                const endsAt = new Date(
                    startsAt.getTime() + 60 * 60 * 1000
                ) .toISOString()

                const reservation = await reservationRepo.create({
                    org_id: orgId,
                    member_id: memberId,
                    customer_id,
                    resource_id,
                    starts_at: startsAt.toISOString(),
                    ends_at: endsAt,
                }, db)

                return {
                    ok: true,
                    reservation,
                }
            }
        }),
    }
}
