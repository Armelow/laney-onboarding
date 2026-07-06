import { notImplemented } from "./not-implemented"

type ChannelKey = "email" | "sms" | "kakao"

interface NotificationChannel {
  send(input: unknown): Promise<unknown>
}

export const CHANNELS = {
  email: {
    send: () => notImplemented("email.send"),
  },
  sms: {
    send: () => notImplemented("sms.send"),
  },
  kakao: {
    send: () => notImplemented("kakao.send"),
  },
} satisfies Record<ChannelKey, NotificationChannel>
