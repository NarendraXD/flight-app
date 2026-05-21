'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/useFlightStore'

export default function ConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const pnr = params.pnr as string
  const { selectedFlight, selectedSeat, resetStore } = useFlightStore()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [])

  async function fetchBooking() {
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('*, passengers(*)')
      .eq('pnr_code', pnr)
      .single()

    setBooking(data)
    setLoading(false)
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading confirmation...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        {/* Success header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h1>
          <p className="text-gray-400 text-sm mt-1">Your flight has been booked successfully</p>
        </div>

        {/* PNR code */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 text-center mb-6 shadow-lg">
          <p className="text-sm opacity-75 mb-1">Your PNR Code</p>
          <p className="text-4xl font-bold tracking-widest">{pnr}</p>
          <p className="text-xs opacity-60 mt-2">Save this code to manage your booking</p>
        </div>

        {/* Flight details */}
        {selectedFlight && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Flight Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Flight</span>
                <span className="text-sm font-medium text-gray-800">{selectedFlight.flight_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Route</span>
                <span className="text-sm font-medium text-gray-800">{selectedFlight.origin} → {selectedFlight.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Departure</span>
                <span className="text-sm font-medium text-gray-800">{formatDateTime(selectedFlight.departs_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Arrival</span>
                <span className="text-sm font-medium text-gray-800">{formatDateTime(selectedFlight.arrives_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Seat details */}
        {selectedSeat && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Seat & Price</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Seat</span>
                <span className="text-sm font-medium text-gray-800">{selectedSeat.seat_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Class</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{selectedSeat.class}</span>
              </div>
              {booking && (
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-semibold text-gray-700">Total Paid</span>
                  <span className="text-sm font-bold text-blue-600">₹{booking.total_price.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passenger details */}
        {booking?.passengers?.[0] && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Passenger</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Name</span>
                <span className="text-sm font-medium text-gray-800">{booking.passengers[0].full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Nationality</span>
                <span className="text-sm font-medium text-gray-800">{booking.passengers[0].nationality}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/bookings')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            View My Bookings
          </button>
          <button
            onClick={() => { resetStore(); router.push('/search') }}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Book Another Flight
          </button>
        </div>

      </div>
    </main>
  )
}