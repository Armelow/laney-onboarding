"use client"

import type { ColumnDef } from "@tanstack/react-table"

export type ReservationRow = {
    id: string
    starts_at: string
    status: string
    customer: {
        name: string
    } | null
    resource: {
        name: string
    } | null
}

export const reservationColumns: ColumnDef<ReservationRow>[] = [
    {
        accessorFn: (row) => row.customer?.name ?? "-",
        header: "손님",

    },
    {
        accessorFn: (row) => row.resource?.name?? "-",
        header: "예약 대상",
    },
    {
        accessorKey: "starts_at",
        header: "시작 시각",
    },
    {
        accessorKey: "status",
        header: "상태",
    },
]