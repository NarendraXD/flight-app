'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/useFlightStore'
import DownloadTicket from '@/app/components/DownloadTicket'
import TravelGuide from '@/app/components/TravelGuide'
export default function ConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const pnr = params.pnr as string
  const { selectedFlight, selectedSeat, resetStore } = useFlightStore()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">✈️</div>
          <p className="text-blue-300">Loading confirmation...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] px-4 py-8">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10" />
      </div>

      <div className={`relative z-10 max-w-md mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Success header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="text-3xl font-bold text-white">Booking Confirmed!</h1>
          <p className="text-blue-300 text-sm mt-2">Your flight has been booked successfully</p>
        </div>

        {/* PNR card */}
        <div className="bg-blue-500/20 border border-blue-500/40 backdrop-blur-xl rounded-3xl p-6 text-center mb-6 shadow-2xl shadow-blue-500/10">
          <p className="text-blue-300 text-sm mb-1">Your PNR Code</p>
          <p className="text-5xl font-bold tracking-widest text-white">{pnr}</p>
          <p className="text-blue-400 text-xs mt-2">Save this code to manage your booking</p>
        </div>

        {/* Flight details */}
        {selectedFlight && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-4">Flight Details</h2>
            <div className="space-y-3">
              {[
                { label: 'Flight', value: selectedFlight.flight_no },
                { label: 'Route', value: `${selectedFlight.origin} → ${selectedFlight.destination}` },
                { label: 'Departure', value: formatDateTime(selectedFlight.departs_at) },
                { label: 'Arrival', value: formatDateTime(selectedFlight.arrives_at) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-sm text-blue-300">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seat details */}
        {selectedSeat && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-4">Seat & Price</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-blue-300">Seat</span>
                <span className="text-sm font-medium text-white">{selectedSeat.seat_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-300">Class</span>
                <span className="text-sm font-medium text-white capitalize">{selectedSeat.class}</span>
              </div>
              {booking && (
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="text-sm font-semibold text-blue-200">Total Paid</span>
                  <span className="text-sm font-bold text-blue-400">₹{booking.total_price.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passenger details */}
        {booking?.passengers?.[0] && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-4">Passenger</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-blue-300">Name</span>
                <span className="text-sm font-medium text-white">{booking.passengers[0].full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-300">Nationality</span>
                <span className="text-sm font-medium text-white">{booking.passengers[0].nationality}</span>
              </div>
            </div>
          </div>
        )}
{/* Travel Guide */}
{selectedFlight && (
  <div className="mb-4">
    <TravelGuide
     city={selectedFlight.destination}
     flightDate= {selectedFlight.departs_at.split('T')[0]} />
  </div>
)}
        {/* Buttons */}
        <div className="space-y-3">
          {booking && selectedFlight && selectedSeat && booking.passengers?.[0] && (
            <DownloadTicket
              pnr={pnr}
              flightNo={selectedFlight.flight_no}
              origin={selectedFlight.origin}
              destination={selectedFlight.destination}
              departs_at={selectedFlight.departs_at}
              arrives_at={selectedFlight.arrives_at}
              seatNumber={selectedSeat.seat_number}
              seatClass={selectedSeat.class}
              passengerName={booking.passengers[0].full_name}
              totalPrice={booking.total_price}
            />
          )}
          <button
            onClick={() => router.push('/bookings')}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-2xl font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30"
          >
            View My Bookings
          </button>
          <button
            onClick={() => { resetStore(); router.push('/search') }}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-medium transition-all"
          >
            Book Another Flight
          </button>
        </div>
      </div>
    </main>
  )
}