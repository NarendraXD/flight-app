'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Flight = {
  id: string
  flight_no: string
  origin: string
  destination: string
  departs_at: string
  arrives_at: string
  base_price: number
}

type Booking = {
  id: string
  flight_id: string
  total_price: number
  flights: {
    origin: string
    destination: string
    departs_at: string
  }
}

export default function ReschedulePage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmFlight, setConfirmFlight] = useState<Flight | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()

    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*, flights(*)')
      .eq('id', bookingId)
      .single()

    setBooking(bookingData)

    if (bookingData) {
      const { data: flightsData } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', bookingData.flights.origin)
        .eq('destination', bookingData.flights.destination)
        .eq('status', 'scheduled')
        .neq('id', bookingData.flight_id)
        .gt('departs_at', new Date().toISOString())

      setFlights(flightsData || [])
    }

    setLoading(false)
  }

  async function handleReschedule(newFlight: Flight) {
    setActionLoading(true)
    setError('')
    const supabase = createClient()

    const fee = Math.max(0, newFlight.base_price - booking!.total_price)

    // insert reschedule record
    const { error: rescheduleError } = await supabase
      .from('reschedules')
      .insert({
        booking_id: bookingId,
        old_flight_id: booking!.flight_id,
        new_flight_id: newFlight.id,
        fee_charged: fee,
      })

    if (rescheduleError) {
      setError(rescheduleError.message)
      setActionLoading(false)
      return
    }

    // update booking
    await supabase
      .from('bookings')
      .update({
        flight_id: newFlight.id,
        status: 'rescheduled',
        total_price: booking!.total_price + fee,
      })
      .eq('id', bookingId)

    router.push('/bookings')
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/bookings')}
          className="text-gray-400 text-sm mb-4 hover:text-gray-600"
        >
          ← Back to bookings
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Reschedule Flight</h1>
        <p className="text-gray-400 text-sm mb-6">Pick an alternative flight on the same route</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {loading && (
          <div className="text-center py-20 text-gray-400">Loading flights...</div>
        )}

        {!loading && flights.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No alternative flights available on this route</p>
            <button
              onClick={() => router.push('/bookings')}
              className="mt-4 text-blue-600 text-sm hover:underline"
            >
              Back to bookings
            </button>
          </div>
        )}

        <div className="space-y-4">
          {flights.map((flight) => {
            const fee = Math.max(0, flight.base_price - (booking?.total_price || 0))
            return (
              <div
                key={flight.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {flight.flight_no}
                  </span>
                  {fee > 0 && (
                    <span className="text-xs text-orange-500 font-medium">
                      +₹{fee.toLocaleString()} fee
                    </span>
                  )}
                  {fee === 0 && (
                    <span className="text-xs text-green-500 font-medium">No extra fee</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  {flight.origin} → {flight.destination}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {formatDateTime(flight.departs_at)}
                </p>

                <button
                  onClick={() => setConfirmFlight(flight)}
                  className="w-full border border-blue-200 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-50 transition"
                >
                  Select this flight
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmFlight && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Reschedule?</h2>
            <p className="text-sm text-gray-400 mb-2">
              New flight: <strong>{confirmFlight.flight_no}</strong>
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Departs: {formatDateTime(confirmFlight.departs_at)}
            </p>
            {Math.max(0, confirmFlight.base_price - (booking?.total_price || 0)) > 0 && (
              <p className="text-sm text-orange-500 mb-4">
                Extra fee: ₹{Math.max(0, confirmFlight.base_price - (booking?.total_price || 0)).toLocaleString()}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmFlight(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => handleReschedule(confirmFlight)}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {actionLoading ? 'Rescheduling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}