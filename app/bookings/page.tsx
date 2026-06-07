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
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  rescheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function BookingsPage() {
  const router = useRouter()
  const { session } = useUserStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelDialog, setCancelDialog] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] px-4 py-8">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="text-blue-300 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          ← Home
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">My Bookings 🎫</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 animate-bounce">🎫</div>
            <p className="text-blue-300">Loading bookings...</p>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">✈️</p>
            <p className="text-white text-lg">No bookings yet</p>
            <button
              onClick={() => router.push('/search')}
              className="mt-4 text-blue-400 hover:text-white text-sm transition-colors"
            >
              Search flights
            </button>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <div
              key={booking.id}
              className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 transition-all duration-500 hover:bg-white/15 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-blue-400 mb-1">PNR</p>
                  <p className="text-xl font-bold text-white tracking-widest">{booking.pnr_code}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize border ${STATUS_COLORS[booking.status]}`}>
                  {booking.status}
                </span>
              </div>

              {/* Flight info */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-white">
                  {booking.flights.flight_no} · {booking.flights.origin} → {booking.flights.destination}
                </p>
                <p className="text-xs text-blue-300">
                  Departs: {formatDateTime(booking.flights.departs_at)}
                </p>
                <p className="text-xs text-blue-300">
                  Seat {booking.seats.seat_number} · {booking.seats.class}
                </p>
                <p className="text-sm font-bold text-blue-400">
                  ₹{booking.total_price.toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              {booking.status === 'confirmed' && (
                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => router.push(`/reschedule/${booking.id}`)}
                    className="flex-1 text-sm border border-blue-500/30 text-blue-400 py-2 rounded-xl hover:bg-blue-500/20 transition-all"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setCancelDialog(booking.id)}
                    className="flex-1 text-sm border border-red-500/30 text-red-400 py-2 rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cancel dialog */}
      {cancelDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Cancel Booking?</h2>
            <p className="text-sm text-blue-300 mb-6">
              This cannot be undone. Cancellations within 2 hours of departure are blocked.
            </p>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setCancelDialog(null); setError('') }}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancel(cancelDialog)}
                disabled={actionLoading}
                className="flex-1 bg-red-500/80 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm disabled:opacity-50 transition-all"
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