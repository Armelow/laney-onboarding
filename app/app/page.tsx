"use client"

import { useState } from "react"
import { reservationRepo } from "../lib/repositories"

const ORG_ID = "00000000-0000-0000-0000-000000000001"

export default function Home () {
  const [reservations, setReservations] = useState<unknown[]>([])
  const [customers, setCustomers] = useState<unknown[]>([])
  const [error, setError] = useState("")

  async function loadReservations() {
    try {
      setError("")
      const data = await reservationRepo.list(ORG_ID)
      setReservations(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  async function loadCustomers() {
    try {
      setError("")
      const data = await reservationRepo.list(ORG_ID)
      setCustomers(data)
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

      {error && <p>{error}</p>}

      <h2>Reservations</h2>
      <pre>{JSON.stringify(reservations, null, 2)}</pre>

      <h2>Customers</h2>
      <pre>{JSON.stringify(customers, null, 2)}</pre>
    </main>
  )
}