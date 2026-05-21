'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/useFlightStore'
import { useUserStore } from '@/store/useUserStore'

function generatePNR() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function BookPage() {
  const router = useRouter()
  const { selectedFlight, selectedSeat, setCurrentStep, resetStore } = useFlightStore()
  const { session } = useUserStore()

  const [fullName, setFullName] = useState('')
  const [passportNo, setPassportNo] = useState('')
  const [nationality, setNationality] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBooking() {
    if (!fullName || !passportNo || !nationality || !dob) {
      setError('Please fill in all fields')
      return
    }

    if (!session) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const pnrCode = generatePNR()
    const totalPrice = selectedFlight!.base_price + selectedSeat!.extra_fee

    // call the seat lock RPC
    const { data: bookingId, error: rpcError } = await supabase.rpc('reserve_seat', {
      p_seat_id: selectedSeat!.id,
      p_user_id: session.user.id,
      p_flight_id: selectedFlight!.id,
      p_total_price: totalPrice,
      p_pnr_code: pnrCode,
    })

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return
    }

    // insert passenger details
    await supabase.from('passengers').insert({
      booking_id: bookingId,
      full_name: fullName,
      passport_no: passportNo,
      nationality,
      dob,
    })

    setCurrentStep('confirmation')
    router.push(`/confirmation/${pnrCode}`)
  }

  if (!selectedFlight || !selectedSeat) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No flight selected</p>
          <button onClick={() => router.push('/search')} className="text-blue-600 hover:underline text-sm">
            Start over
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="text-gray-400 text-sm mb-4 hover:text-gray-600"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Passenger Details</h1>
        <p className="text-gray-400 text-sm mb-6">Fill in your details to complete booking</p>

        {/* Booking summary */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-700">{selectedFlight.flight_no} · {selectedFlight.origin} → {selectedFlight.destination}</p>
          <p className="text-xs text-gray-400 mt-1">Seat {selectedSeat.seat_number} · {selectedSeat.class}</p>
          <p className="text-lg font-bold text-blue-600 mt-2">
            ₹{(selectedFlight.base_price + selectedSeat.extra_fee).toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As on passport"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
            <input
              type="text"
              value={passportNo}
              onChange={(e) => setPassportNo(e.target.value)}
              placeholder="e.g. A1234567"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            <input
              type="text"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g. Indian"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleBooking}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Booking...' : 'Confirm Booking ✈️'}
          </button>
        </div>
      </div>
    </main>
  )
}