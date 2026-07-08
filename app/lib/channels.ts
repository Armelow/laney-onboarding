import { supabase } from "./supabase"

type ChannelKey = "email" | "sms" | "kakao" | "webhook"

type NotificationPayload = {
  orgId: string
  reservationId: string
  customerId: string
  content: string
  startsAt: string
  endsAt: string
}

interface NotificationChannel {
  send(payload: NotificationPayload): Promise<void>
}

async function recordSent(channel: ChannelKey, payload: NotificationPayload) {
  const { error } = await supabase.from("notification").insert({
    org_id: payload.orgId,
    reservation_id: payload.reservationId,
    customer_id: payload.customerId,
    content: `[${channel}] ${payload.content}`,
    starts_at: payload.startsAt,
    ends_at: payload.endsAt,
    status: "sent"
  })

  if (error) throw new Error(error.message)
}

const email: NotificationChannel = {
  send: async (payload) => {
    await recordSent("email", payload)
  },
}

const sms: NotificationChannel = {
  send: async (payload) => {
    await recordSent("sms", payload)
  },
}

const kakao: NotificationChannel = {
  send: async (payload) => {
    await recordSent("kakao", payload)
  },
}

const webhook: NotificationChannel = {
  send: async (payload) => {
    await recordSent("webhook", payload)
  },
}

export const CHANNELS = {
  email,
  sms,
  kakao,
  webhook,
} satisfies Record<ChannelKey, NotificationChannel>