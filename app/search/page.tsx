'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad']

export default function SearchPage() {
  const router = useRouter()
  const setSearchQuery = useFlightStore((s) => s.setSearchQuery)
  const setCurrentStep = useFlightStore((s) => s.setCurrentStep)

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [error, setError] = useState('')

  function handleSearch() {
    if (!origin || !destination || !date) {
      setError('Please fill in all fields')
      return
    }
    if (origin === destination) {
      setError('Origin and destination cannot be the same')
      return
    }

    setSearchQuery({ origin, destination, date, passengerCount })
    setCurrentStep('results')
    router.push('/flights')
  }

  // get tomorrow's date as minimum
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 text-sm mb-4 hover:text-gray-600"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Search Flights</h1>
        <p className="text-gray-400 text-sm mb-6">Find the best flights for your trip</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select origin</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select destination</option>
              {CITIES.filter((c) => c !== origin).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
            <select
              value={passengerCount}
              onChange={(e) => setPassengerCount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Search Flights ✈️
          </button>
        </div>
      </div>
    </main>
  )
}