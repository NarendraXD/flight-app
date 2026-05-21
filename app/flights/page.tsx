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

  useEffect(() => {
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

    if (error) {
      setError('Failed to load flights')
    } else {
      setFlights(data || [])
    }
    setLoading(false)
  }

  function handleSelect(flight: Flight) {
    setSelectedFlight(flight)
    setCurrentStep('seats')
    router.push(`/seats/${flight.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/search')}
          className="text-gray-400 text-sm mb-4 hover:text-gray-600"
        >
          ← Back to search
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Available Flights</h1>
        {searchQuery && (
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery.origin} → {searchQuery.destination} · {searchQuery.date} · {searchQuery.passengerCount} passenger{searchQuery.passengerCount > 1 ? 's' : ''}
          </p>
        )}

        {loading && (
          <div className="text-center py-20 text-gray-400">Loading flights...</div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {!loading && flights.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No flights found</p>
            <p className="text-gray-300 text-sm mt-1">Try a different date or route</p>
            <button
              onClick={() => router.push('/search')}
              className="mt-4 text-blue-600 text-sm hover:underline"
            >
              Search again
            </button>
          </div>
        )}

        <div className="space-y-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {flight.flight_no}
                </span>
                <span className="text-xs text-gray-400">{flight.aircraft_type}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{formatTime(flight.departs_at)}</p>
                  <p className="text-sm text-gray-400">{flight.origin}</p>
                </div>

                <div className="flex-1 mx-4 text-center">
                  <p className="text-xs text-gray-400">{formatDuration(flight.departs_at, flight.arrives_at)}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="mx-2 text-gray-300">✈</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Direct</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{formatTime(flight.arrives_at)}</p>
                  <p className="text-sm text-gray-400">{flight.destination}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xl font-bold text-gray-800">₹{flight.base_price.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">per passenger</p>
                </div>
                <button
                  onClick={() => handleSelect(flight)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
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