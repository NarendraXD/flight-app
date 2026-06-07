'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore, Seat } from '@/store/useFlightStore'

const CLASS_ORDER = ['first', 'business', 'economy'] as const
type SeatPreference = 'all' | 'window' | 'aisle' | 'middle'

const CLASS_STYLES: Record<string, string> = {
  first: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  business: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  economy: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
}

export default function SeatsPage() {
  const router = useRouter()
  const params = useParams()
  const flightId = params.flightId as string

  const { selectedFlight, selectedSeat, setSelectedSeat, setCurrentStep } = useFlightStore()

  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [preference, setPreference] = useState<SeatPreference>('all')

  useEffect(() => {
    if (!selectedFlight) {
      router.push('/search')
      return
    }
    fetchSeats()

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

  function matchesPreference(seatNumber: string, pref: SeatPreference) {
    const letter = seatNumber.slice(-1)
    if (pref === 'window') return ['A', 'F'].includes(letter)
    if (pref === 'aisle') return ['C', 'D'].includes(letter)
    if (pref === 'middle') return ['B', 'E'].includes(letter)
    return true
  }

  const seatsByClass = CLASS_ORDER.map((cls) => ({
    cls,
    seats: seats.filter((s) => s.class === cls && matchesPreference(s.seat_number, preference)),
  }))

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] px-4 py-8">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pb-32">
        <button
          onClick={() => router.push('/flights')}
          className="text-blue-300 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          ← Back to flights
        </button>

        <h1 className="text-2xl font-bold text-white mb-1">Select Your Seat</h1>
        {selectedFlight && (
          <p className="text-blue-300 text-sm mb-6">
            {selectedFlight.flight_no} · {selectedFlight.origin} → {selectedFlight.destination}
          </p>
        )}

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs text-blue-300 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-blue-500 inline-block" /> Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-white/10 border border-white/20 inline-block" /> Occupied
          </span>
        </div>

        {/* Preference filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'window', 'aisle', 'middle'] as SeatPreference[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreference(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                preference === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-blue-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              {p === 'all' ? '🪑 All' : p === 'window' ? '🪟 Window' : p === 'aisle' ? '🚶 Aisle' : '↔️ Middle'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 animate-bounce">🪑</div>
            <p className="text-blue-300">Loading seat map...</p>
          </div>
        )}

        <div className="space-y-8 overflow-auto">
          {seatsByClass.map(({ cls, seats: classSeats }) => {
            const rows: Record<string, Seat[]> = {}
            classSeats.forEach((s) => {
              const row = s.seat_number.slice(0, -1)
              if (!rows[row]) rows[row] = []
              rows[row].push(s)
            })

            if (Object.keys(rows).length === 0) return null

            return (
              <div key={cls}>
                <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border mb-3 ${CLASS_STYLES[cls]}`}>
                  <span className="capitalize">{cls} Class</span>
                  {cls !== 'economy' && (
                    <span className="opacity-60">+₹{classSeats[0]?.extra_fee.toLocaleString()}</span>
                  )}
                </div>

                <div className="space-y-2">
                  {Object.entries(rows).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-1">
                      <span className="text-xs text-blue-400/50 w-6 text-right">{row}</span>
                      <div className="flex gap-1 ml-2">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSeat?.id === seat.id
                          const isOccupied = !seat.is_available

                          let seatClass = 'bg-green-500/30 border-green-500/50 hover:bg-green-500/50 cursor-pointer text-green-300'
                          if (isSelected) seatClass = 'bg-blue-500 border-blue-400 text-white cursor-pointer scale-110'
                          if (isOccupied) seatClass = 'bg-white/5 border-white/10 cursor-not-allowed text-white/20'

                          return (
                            <div key={seat.id} className="relative group">
                              <button
                                onClick={() => handleSeatClick(seat)}
                                disabled={isOccupied}
                                className={`w-8 h-8 rounded-lg text-xs border font-medium transition-all ${seatClass}`}
                              >
                                {seat.seat_number.slice(-1)}
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                                <div className="bg-gray-900 border border-white/20 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
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
      </div>

      {/* Bottom bar */}
      {selectedSeat && (
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0f1e]/80 border-t border-white/10 p-4 shadow-2xl">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Seat {selectedSeat.seat_number} · <span className="capitalize">{selectedSeat.class}</span>
              </p>
              <p className="text-xs text-blue-300">
                ₹{(selectedFlight!.base_price + selectedSeat.extra_fee).toLocaleString()} total
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </main>
  )
}