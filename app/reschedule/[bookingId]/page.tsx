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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] px-4 py-8">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/bookings')}
          className="text-blue-300 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          ← Back to bookings
        </button>

        <h1 className="text-2xl font-bold text-white mb-1">Reschedule Flight</h1>
        <p className="text-blue-300 text-sm mb-6">Pick an alternative flight on the same route</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 animate-bounce">✈️</div>
            <p className="text-blue-300">Loading flights...</p>
          </div>
        )}

        {!loading && flights.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white">No alternative flights available</p>
            <button
              onClick={() => router.push('/bookings')}
              className="mt-4 text-blue-400 hover:text-white text-sm transition-colors"
            >
              Back to bookings
            </button>
          </div>
        )}

        <div className="space-y-4">
          {flights.map((flight, index) => {
            const fee = Math.max(0, flight.base_price - (booking?.total_price || 0))
            return (
              <div
                key={flight.id}
                className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 transition-all duration-500 hover:bg-white/15 hover:border-blue-400/40 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                    {flight.flight_no}
                  </span>
                  {fee > 0 ? (
                    <span className="text-xs text-orange-400 font-medium">+₹{fee.toLocaleString()} fee</span>
                  ) : (
                    <span className="text-xs text-green-400 font-medium">No extra fee</span>
                  )}
                </div>

                <p className="text-sm text-white font-medium mb-1">
                  {flight.origin} → {flight.destination}
                </p>
                <p className="text-xs text-blue-300 mb-4">
                  {formatDateTime(flight.departs_at)}
                </p>
                <p className="text-lg font-bold text-white mb-4">
                  ₹{flight.base_price.toLocaleString()}
                </p>

                <button
                  onClick={() => setConfirmFlight(flight)}
                  className="w-full border border-blue-500/30 text-blue-400 py-2 rounded-xl text-sm hover:bg-blue-500/20 transition-all"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Confirm Reschedule?</h2>
            <p className="text-sm text-blue-300 mb-1">
              New flight: <span className="text-white font-medium">{confirmFlight.flight_no}</span>
            </p>
            <p className="text-sm text-blue-300 mb-2">
              Departs: <span className="text-white">{formatDateTime(confirmFlight.departs_at)}</span>
            </p>
            {Math.max(0, confirmFlight.base_price - (booking?.total_price || 0)) > 0 && (
              <p className="text-sm text-orange-400 mb-4">
                Extra fee: ₹{Math.max(0, confirmFlight.base_price - (booking?.total_price || 0)).toLocaleString()}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmFlight(null)}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={() => handleReschedule(confirmFlight)}
                disabled={actionLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-400 text-white py-2.5 rounded-xl text-sm disabled:opacity-50 transition-all"
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