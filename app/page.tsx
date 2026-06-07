'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] flex flex-col items-center justify-center px-4">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500" />
      </div>

      {/* Star dots background */}
      <div className="absolute inset-0 pointer-events-none">
        {mounted && [...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 text-center mb-10 transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-6xl mb-4">✈️</div>
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          Flight<span className="text-blue-400">App</span>
        </h1>
        <p className="text-blue-200 text-lg">Search, book, and manage your flights</p>
      </div>

      {/* Glass card */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-1000 delay-300 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6">Where are you flying today?</h2>

          <div className="space-y-3">
            <Link
              href="/search"
              className="flex items-center justify-between w-full bg-blue-500 hover:bg-blue-400 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30"
            >
              <span>Search Flights</span>
              <span className="text-xl">✈️</span>
            </Link>

            <Link
              href="/bookings"
              className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl font-medium border border-white/20 transition-all duration-200 hover:scale-[1.02]"
            >
              <span>My Bookings</span>
              <span className="text-xl">🎫</span>
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center justify-center w-full text-blue-300 hover:text-white text-sm py-2 transition-colors duration-200"
            >
              Sign out / Switch account
            </Link>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Routes', value: '8+' },
            { label: 'Daily Flights', value: '80+' },
            { label: 'Cities', value: '6' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 text-center"
            >
              <p className="text-white font-bold text-xl">{stat.value}</p>
              <p className="text-blue-300 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}