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
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-300 mb-4">No flight selected</p>
          <button onClick={() => router.push('/search')} className="text-blue-400 hover:text-white text-sm transition-colors">
            Start over
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] px-4 py-8">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-300 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-1">Passenger Details</h1>
        <p className="text-blue-300 text-sm mb-6">Fill in your details to complete booking</p>

        {/* Booking summary */}
        <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-6">
          <p className="text-sm font-medium text-white">{selectedFlight.flight_no} · {selectedFlight.origin} → {selectedFlight.destination}</p>
          <p className="text-xs text-blue-300 mt-1">Seat {selectedSeat.seat_number} · {selectedSeat.class}</p>
          <p className="text-xl font-bold text-blue-400 mt-2">
            ₹{(selectedFlight.base_price + selectedSeat.extra_fee).toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
          {[
            { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'As on passport', type: 'text' },
            { label: 'Passport Number', value: passportNo, setter: setPassportNo, placeholder: 'e.g. A1234567', type: 'text' },
            { label: 'Nationality', value: nationality, setter: setNationality, placeholder: 'e.g. Indian', type: 'text' },
            { label: 'Date of Birth', value: dob, setter: setDob, placeholder: '', type: 'date' },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-blue-200 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all [color-scheme:dark]"
              />
            </div>
          ))}

          <button
            onClick={handleBooking}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 mt-2"
          >
            {loading ? 'Booking...' : 'Confirm Booking ✈️'}
          </button>
        </div>
      </div>
    </main>
  )
}