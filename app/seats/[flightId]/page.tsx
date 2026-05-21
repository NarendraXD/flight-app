'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore, Seat } from '@/store/useFlightStore'

const CLASS_ORDER = ['first', 'business', 'economy'] as const

const CLASS_COLORS: Record<string, string> = {
  first: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  business: 'bg-purple-100 border-purple-300 text-purple-800',
  economy: 'bg-blue-100 border-blue-300 text-blue-800',
}

export default function SeatsPage() {
  const router = useRouter()
  const params = useParams()
  const flightId = params.flightId as string

  const { selectedFlight, selectedSeat, setSelectedSeat, setCurrentStep } = useFlightStore()

  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedFlight) {
      router.push('/search')
      return
    }
    fetchSeats()

    // realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel('seats-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seats', filter: `flight_id=eq.${flightId}` },
        (payload) => {
          setSeats((prev) =>
            prev.map((s) => (s.id === payload.new.id ? { ...s, ...payload.new } : s))
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchSeats() {
    const supabase = createClient()
    const { data } = await supabase
      .from('seats')
      .select('*')
      .eq('flight_id', flightId)
      .order('seat_number')

    setSeats(data || [])
    setLoading(false)
  }

  function handleSeatClick(seat: Seat) {
    if (!seat.is_available) return
    setSelectedSeat(seat)
  }

  function handleContinue() {
    if (!selectedSeat) return
    setCurrentStep('passenger')
    router.push('/book')
  }

  // group seats by class then by row
  const seatsByClass = CLASS_ORDER.map((cls) => ({
    cls,
    seats: seats.filter((s) => s.class === cls),
  }))

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/flights')}
          className="text-gray-400 text-sm mb-4 hover:text-gray-600"
        >
          ← Back to flights
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Select Your Seat</h1>
        {selectedFlight && (
          <p className="text-gray-400 text-sm mb-6">
            {selectedFlight.flight_no} · {selectedFlight.origin} → {selectedFlight.destination}
          </p>
        )}

        {/* Legend */}
        <div className="flex gap-4 mb-6 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-200 border border-green-400 inline-block" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-500 inline-block" /> Selected</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-200 border border-gray-300 inline-block" /> Occupied</span>
        </div>

        {loading && <div className="text-center py-20 text-gray-400">Loading seat map...</div>}

        <div className="space-y-8 overflow-auto">
          {seatsByClass.map(({ cls, seats: classSeats }) => {
            // group into rows
            const rows: Record<string, Seat[]> = {}
            classSeats.forEach((s) => {
              const row = s.seat_number.slice(0, -1)
              if (!rows[row]) rows[row] = []
              rows[row].push(s)
            })

            return (
              <div key={cls}>
                <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-3 ${CLASS_COLORS[cls]}`}>
                  {cls.charAt(0).toUpperCase() + cls.slice(1)} Class
                  {cls !== 'economy' && <span className="ml-1 opacity-60">+₹{classSeats[0]?.extra_fee.toLocaleString()}</span>}
                </div>

                <div className="space-y-2">
                  {Object.entries(rows).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-1">
                      <span className="text-xs text-gray-300 w-6 text-right">{row}</span>
                      <div className="flex gap-1 ml-2">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSeat?.id === seat.id
                          const isOccupied = !seat.is_available

                          let seatClass = 'bg-green-200 border-green-400 cursor-pointer hover:bg-green-300'
                          if (isSelected) seatClass = 'bg-blue-500 border-blue-600 text-white cursor-pointer'
                          if (isOccupied) seatClass = 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60'

                          return (
                            <div key={seat.id} className="relative group">
                              <button
                                onClick={() => handleSeatClick(seat)}
                                disabled={isOccupied}
                                className={`w-8 h-8 rounded text-xs border font-medium transition ${seatClass}`}
                              >
                                {seat.seat_number.slice(-1)}
                              </button>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                                <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  {seat.seat_number} · {seat.class}
                                  {seat.extra_fee > 0 && ` · +₹${seat.extra_fee}`}
                                  {isOccupied && ' · Occupied'}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {selectedSeat && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Seat {selectedSeat.seat_number} · {selectedSeat.class}
                </p>
                <p className="text-xs text-gray-400">
                  ₹{(selectedFlight!.base_price + selectedSeat.extra_fee).toLocaleString()} total
                </p>
              </div>
              <button
                onClick={handleContinue}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Continue →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}