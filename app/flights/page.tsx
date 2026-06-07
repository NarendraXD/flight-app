'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore, Flight } from '@/store/useFlightStore'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(departs: string, arrives: string) {
  const diff = new Date(arrives).getTime() - new Date(departs).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

export default function FlightsPage() {
  const router = useRouter()
  const { searchQuery, setSelectedFlight, setCurrentStep } = useFlightStore()

  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!searchQuery) {
      router.push('/search')
      return
    }
    fetchFlights()
  }, [])

  async function fetchFlights() {
    const supabase = createClient()
    const searchDate = new Date(searchQuery!.date)
    const nextDay = new Date(searchDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', searchQuery!.origin)
      .eq('destination', searchQuery!.destination)
      .gte('departs_at', searchDate.toISOString())
      .lt('departs_at', nextDay.toISOString())
      .eq('status', 'scheduled')

    if (error) setError('Failed to load flights')
    else setFlights(data || [])
    setLoading(false)
  }

  function handleSelect(flight: Flight) {
    setSelectedFlight(flight)
    setCurrentStep('seats')
    router.push(`/seats/${flight.id}`)
  }

  const sorted = [...flights].sort((a, b) =>
    sortBy === 'price'
      ? a.base_price - b.base_price
      : new Date(a.departs_at).getTime() - new Date(b.departs_at).getTime()
  )

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] px-4 py-8">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/search')}
          className="text-blue-300 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          ← Back to search
        </button>

        <h1 className="text-2xl font-bold text-white mb-1">Available Flights</h1>
        {searchQuery && (
          <p className="text-blue-300 text-sm mb-4">
            {searchQuery.origin} → {searchQuery.destination} · {searchQuery.date} · {searchQuery.passengerCount} passenger{searchQuery.passengerCount > 1 ? 's' : ''}
          </p>
        )}

        {/* Sort tabs */}
        <div className="flex gap-2 mb-6">
          {(['price', 'time'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                sortBy === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-blue-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              Sort by {s === 'price' ? '💰 Price' : '🕐 Time'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20 text-blue-300">
            <div className="text-4xl mb-3 animate-bounce">✈️</div>
            <p>Searching flights...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {!loading && flights.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white text-lg">No flights found</p>
            <p className="text-blue-300 text-sm mt-1">Try a different date or route</p>
            <button
              onClick={() => router.push('/search')}
              className="mt-4 text-blue-400 text-sm hover:text-white transition-colors"
            >
              Search again
            </button>
          </div>
        )}

        <div className="space-y-4">
          {sorted.map((flight, index) => (
            <div
              key={flight.id}
              className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 transition-all duration-500 hover:bg-white/15 hover:border-blue-400/40 hover:scale-[1.01] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                  {flight.flight_no}
                </span>
                <span className="text-xs text-blue-300">{flight.aircraft_type}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{formatTime(flight.departs_at)}</p>
                  <p className="text-sm text-blue-300 mt-1">{flight.origin}</p>
                </div>

                <div className="flex-1 mx-4 text-center">
                  <p className="text-xs text-blue-400 mb-1">{formatDuration(flight.departs_at, flight.arrives_at)}</p>
                  <div className="flex items-center">
                    <div className="flex-1 h-px bg-white/20" />
                    <span className="mx-2 text-blue-400 text-sm">✈</span>
                    <div className="flex-1 h-px bg-white/20" />
                  </div>
                  <p className="text-xs text-blue-400 mt-1">Direct</p>
                </div>

                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{formatTime(flight.arrives_at)}</p>
                  <p className="text-sm text-blue-300 mt-1">{flight.destination}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">₹{flight.base_price.toLocaleString()}</p>
                  <p className="text-xs text-blue-300">per passenger</p>
                </div>
                <button
                  onClick={() => handleSelect(flight)}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Select →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}