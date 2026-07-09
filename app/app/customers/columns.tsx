"use client"

import type { ColumnDef } from "@tanstack/react-table"

export type CustomerRow = {
    id: string
    name: string
    phone: string
}

export const customerColumns: ColumnDef<CustomerRow>[] = [
    {
        accessorKey: "name",
        header: "이름"
    },
    {
        accessorKey: "phone",
        header: "전화번호"
    },
]