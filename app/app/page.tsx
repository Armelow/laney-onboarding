"use client"

import { reservationRepo } from "../lib/repositories"

export default function Home () {
  return (
    <main>
      <h1>Reservation App Skeleton</h1>

      <button onClick={() => reservationRepo.list("demo-org-id")}>
        Load reservations
      </button>
    </main>
  )
}