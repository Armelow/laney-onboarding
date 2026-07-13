import { generateObject } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { reservationIntentSchema } from "@/lib/reservation-schema"
import { customerRepo } from "@/lib/repositories"

export async function POST(request: Request) {
    const { text, orgId } = await request.json()

    if (
        typeof text !== "string" ||
        !text.trim() ||
        typeof orgId !== "string" ||
        !orgId.trim()
    ) {
        return Response.json(
            { error: "text가 필요합니다." },
            { status: 400 }
        )
    }

    try {
        const { object } = await generateObject({
            model: anthropic("claude-sonnet-4-6"),
            schema: reservationIntentSchema,
            prompt: `
                다음 문장을 예약 데이터로 바꿔줘.
                현재 날짜는 2026-07-13이야.

                ${text}
            `,
        })
    const customers =
            await customerRepo.list(orgId) as Array<{ name: string }>

    const customerExists = customers.some(
        (customer) =>
            customer.name.trim().toLowerCase() ===
        object.customer_name.trim().toLowerCase()
    )

    if (!customerExists) {
        return Response.json(
            { error: `존재하지 않는 손님입니다: ${object.customer_name}` },
            { status: 422 }
        )
    }

    const startsAt = new Date(object.starts_at)

    if (Number.isNaN(startsAt.getTime())) {
        return Response.json(
            { error: "올바르지 않은 시작 시각입니다."},
            { status: 422 }
        )
    }

    return Response.json(object)
    } catch (error) {
        return Response.json (
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
