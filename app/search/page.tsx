'use client'

import { useState, useEffect } from 'react'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] flex items-center justify-center px-4">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        <button
          onClick={() => router.push('/')}
          className="text-blue-300 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Search Flights ✈️</h1>
          <p className="text-blue-300 text-sm mb-6">Find the best flights for your trip</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">From</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
              >
                <option value="" className="bg-[#0a0f1e] text-gray-400">Select origin</option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0a0f1e] text-white">{c}</option>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => { const temp = origin; setOrigin(destination); setDestination(temp) }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all hover:rotate-180 duration-300"
              >
                ⇅
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">To</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
              >
                <option value="" className="bg-[#0a0f1e] text-gray-400">Select destination</option>
                {CITIES.filter((c) => c !== origin).map((c) => (
                  <option key={c} value={c} className="bg-[#0a0f1e] text-white">{c}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Date</label>
              <input
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Passengers */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Passengers</label>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <button
                  onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                  className="text-white bg-white/20 hover:bg-white/30 w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all"
                >
                  -
                </button>
                <span className="flex-1 text-center text-white text-sm font-medium">
                  {passengerCount} passenger{passengerCount > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setPassengerCount(Math.min(5, passengerCount + 1))}
                  className="text-white bg-white/20 hover:bg-white/30 w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 mt-2"
            >
              Search Flights ✈️
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}