import { generateText, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createAgentTools } from "@/lib/agent-tools"
import { createSupabaseForRequest } from "@/lib/supabase"

export async function POST(request: Request) {
    const { text, orgId, memberId } = await request.json()
    const authorization = request.headers.get("authorization")
    const accessToken = authorization?.replace(/^Bearer\s+/i, "").trim()

    if (!accessToken) {
        return Response.json(
            { error: "로그인 토큰이 필요합니다."},
            { status: 401 }
        )
    }

    const requestSupabase = createSupabaseForRequest(accessToken)

    if (
        typeof text !== "string" ||
        !text.trim() ||
        typeof orgId !== "string" ||
        !orgId.trim() ||
        typeof memberId !== "string" ||
        !memberId.trim()
    ) {
        return Response.json(
            { error: "text와 orgId, memberId가 필요합니다."},
            { status: 400 }
        )
    }

    try {
        const result = await generateText({
            model: anthropic("claude-sonnet-4-6"),
            tools: createAgentTools(
                orgId,
                memberId,
                requestSupabase
            ),
            stopWhen: stepCountIs(5),
            prompt: `
                예약 생성 요청이면 다음 순서로 처리해.

                1. 고객 이름으로 findCustomer를 호출해.
                2. 예약 대상 이름으로 findResource를 호출해.
                3. 두 도구에서 실제 id를 얻은 뒤 createReservation을 호출해.
                4. 도구 결과에 없는 고객이나 예약 대상을 사용하지 마.
                5. 도구 결과를 바탕으로 짧게 답해.

                사용자 요청:
                ${text}
            `,
        })

        return Response.json({
            text: result.text,
        })
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
