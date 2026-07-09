"use client"

import { useState } from "react"
import { customerRepo, reservationRepo } from "../lib/repositories"
import { CHANNELS } from "../lib/channels"
import { DataTable } from "../components/data-table"
import { 
  reservationColumns, 
  type ReservationRow, 
  } from "./reservations/columns"
import { 
  customerColumns, 
  type CustomerRow 
  } from "./customers/columns"

const ORG_ID = "00000000-0000-0000-0000-000000000001"

export default function Home () {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [error, setError] = useState("")

  async function loadReservations() {
    try {
      setError("")
      const data = await reservationRepo.list(ORG_ID)
      setReservations(data as ReservationRow[])
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  async function loadCustomers() {
    try {
      setError("")
      const data = await customerRepo.list(ORG_ID)
      setCustomers(data as CustomerRow[])
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  async function sendTestNotification() {
    try {
      setError("")

      await CHANNELS.email.send({
        orgId: ORG_ID,
        reservationId: "40000000-0000-0000-0000-000000000001",
        customerId: "20000000-0000-0000-0000-000000000001",
        content: "예약 안내 테스트",
        startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      })

      setError("notification sent")
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <main>
      <h1>Reservation App Skeleton</h1>

      <button onClick={loadReservations}>
        Load reservations
      </button>

      <button onClick={loadCustomers}>
        Load customers
      </button>

      <button onClick={sendTestNotification}>
        Send test notification
      </button>

      {error && <p>{error}</p>}

      <h2>Reservations</h2>
      <DataTable columns={reservationColumns} data={reservations} />

      <h2>Customers</h2>
      <DataTable columns={customerColumns} data={customers} />
    </main>
  )
}