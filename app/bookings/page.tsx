'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'

type Booking = {
  id: string
  pnr_code: string
  status: string
  total_price: number
  booked_at: string
  flights: {
    flight_no: string
    origin: string
    destination: string
    departs_at: string
    arrives_at: string
  }
  seats: {
    seat_number: string
    class: string
  }
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  rescheduled: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function BookingsPage() {
  const router = useRouter()
  const { session } = useUserStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelDialog, setCancelDialog] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchBookings()
  }, [])

  async function fetchBookings() {
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('*, flights(*), seats(*)')
      .eq('user_id', session!.user.id)
      .order('booked_at', { ascending: false })

    setBookings(data || [])
    setLoading(false)
  }

  async function handleCancel(bookingId: string) {
    setActionLoading(true)
    setError('')
    const supabase = createClient()

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      setError(error.message)
    } else {
      // free the seat
      const booking = bookings.find((b) => b.id === bookingId)
      if (booking) {
        await supabase
          .from('seats')
          .update({ is_available: true })
          .eq('seat_number', booking.seats.seat_number)
      }
      await fetchBookings()
      setCancelDialog(null)
    }
    setActionLoading(false)
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
          onClick={() => router.push('/')}
          className="text-gray-400 text-sm mb-4 hover:text-gray-600"
        >
          ← Home
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Bookings</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {loading && (
          <div className="text-center py-20 text-gray-400">Loading bookings...</div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No bookings yet</p>
            <button
              onClick={() => router.push('/search')}
              className="mt-4 text-blue-600 text-sm hover:underline"
            >
              Search flights
            </button>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">PNR</p>
                  <p className="text-lg font-bold text-gray-800 tracking-widest">{booking.pnr_code}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_COLORS[booking.status]}`}>
                  {booking.status}
                </span>
              </div>

              {/* Flight info */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">
                  {booking.flights.flight_no} · {booking.flights.origin} → {booking.flights.destination}
                </p>
                <p className="text-xs text-gray-400">
                  Departs: {formatDateTime(booking.flights.departs_at)}
                </p>
                <p className="text-xs text-gray-400">
                  Seat {booking.seats.seat_number} · {booking.seats.class}
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  ₹{booking.total_price.toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              {booking.status === 'confirmed' && (
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/reschedule/${booking.id}`)}
                    className="flex-1 text-sm border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setCancelDialog(booking.id)}
                    className="flex-1 text-sm border border-red-200 text-red-500 py-2 rounded-lg hover:bg-red-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      {cancelDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Cancel Booking?</h2>
            <p className="text-sm text-gray-400 mb-6">
              This action cannot be undone. Note: cancellations within 2 hours of departure are not allowed.
            </p>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setCancelDialog(null); setError('') }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancel(cancelDialog)}
                disabled={actionLoading}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}