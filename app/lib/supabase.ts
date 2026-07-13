import {
    createClient,
    type SupabaseClient,
} from "@supabase/supabase-js"

import type { Database } from "./database.types"

export type DbClient = SupabaseClient<Database>

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export function createSupabaseForRequest(accessToken: string) {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        }
    )
}
