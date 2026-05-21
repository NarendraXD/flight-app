import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '@supabase/supabase-js'

export type CachedBooking = {
  id: string
  pnr_code: string
  status: string
  total_price: number
  booked_at: string
  flight_id: string
}

type UserStore = {
  session: Session | null
  cachedBookings: CachedBooking[]

  setSession: (s: Session | null) => void
  setCachedBookings: (b: CachedBooking[]) => void
  resetUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      session: null,
      cachedBookings: [],

      setSession: (s) => set({ session: s }),
      setCachedBookings: (b) => set({ cachedBookings: b }),
      resetUser: () => set({ session: null, cachedBookings: [] }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
)