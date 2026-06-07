'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PriceMap = Record<string, number>

type Props = {
  origin: string
  destination: string
  onSelectDate: (date: string) => void
  selectedDate: string
}

export default function PriceCalendar({ origin, destination, onSelectDate, selectedDate }: Props) {
  const [prices, setPrices] = useState<PriceMap>({})
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (origin && destination) fetchPrices()
  }, [origin, destination, currentMonth])

  async function fetchPrices() {
    setLoading(true)
    const supabase = createClient()

    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const { data } = await supabase
      .from('flights')
      .select('departs_at, base_price')
      .eq('origin', origin)
      .eq('destination', destination)
      .eq('status', 'scheduled')
      .gte('departs_at', start.toISOString())
      .lte('departs_at', end.toISOString())

    const priceMap: PriceMap = {}
    data?.forEach((f) => {
      const date = f.departs_at.split('T')[0]
      if (!priceMap[date] || f.base_price < priceMap[date]) {
        priceMap[date] = f.base_price
      }
    })

    setPrices(priceMap)
    setLoading(false)
  }

  function getDaysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function getFirstDayOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  function formatDateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getPriceColor(price: number) {
    const allPrices = Object.values(prices)
    if (allPrices.length === 0) return 'text-blue-300'
    const min = Math.min(...allPrices)
    const max = Math.max(...allPrices)
    const range = max - min
    if (price <= min + range * 0.33) return 'text-green-400'
    if (price <= min + range * 0.66) return 'text-yellow-400'
    return 'text-red-400'
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const today = new Date().toISOString().split('T')[0]

  const monthName = currentMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="text-blue-300 hover:text-white w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">{monthName}</p>
          {loading && <p className="text-blue-400 text-xs">Loading prices...</p>}
        </div>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="text-blue-300 hover:text-white w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs text-blue-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for first day offset */}
        {[...Array(firstDay)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1
          const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const price = prices[dateKey]
          const isPast = dateKey <= today
          const isSelected = dateKey === selectedDate
          const hasPrice = !!price

          return (
            <button
              key={day}
              onClick={() => !isPast && hasPrice && onSelectDate(dateKey)}
              disabled={isPast || !hasPrice}
              className={`rounded-xl p-1 text-center transition-all ${
                isSelected
                  ? 'bg-blue-500 border border-blue-400'
                  : hasPrice && !isPast
                  ? 'bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <p className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-blue-200'}`}>
                {day}
              </p>
              {price && (
                <p className={`text-[9px] font-semibold leading-tight ${isSelected ? 'text-blue-100' : getPriceColor(price)}`}>
                  ₹{(price / 1000).toFixed(1)}k
                </p>
              )}
            </button>
          )
        })}
      </div>

      {/* Price legend */}
      <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-white/10">
        <span className="flex items-center gap-1 text-xs text-green-400">● Cheap</span>
        <span className="flex items-center gap-1 text-xs text-yellow-400">● Medium</span>
        <span className="flex items-center gap-1 text-xs text-red-400">● Expensive</span>
      </div>
    </div>
  )
}