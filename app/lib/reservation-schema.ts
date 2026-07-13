import { z } from "zod"

export const reservationIntentSchema = z.object({
    customer_name: z.string().min(1),
    starts_at: z.string().describe("ISO 8601 형식의 시작 시각"),
    resource: z.string().min(1),
})

export type ReservationIntent = z.infer<
    typeof reservationIntentSchema
>
