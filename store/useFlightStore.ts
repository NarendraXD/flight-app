import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BookingStep = 'search' | 'results' | 'seats' | 'passenger' | 'confirmation'

export type SearchQuery = {
  origin: string
  destination: string
  date: string
  passengerCount: number
}

export type Flight = {
  id: string
  flight_no: string
  origin: string
  destination: string
  departs_at: string
  arrives_at: string
  aircraft_type: string
  status: string
  base_price: number
}

export type Seat = {
  id: string
  flight_id: string
  seat_number: string
  class: 'economy' | 'business' | 'first'
  is_available: boolean
  extra_fee: number
}

export type PassengerForm = {
  full_name: string
  nationality: string
  dob: string
  passport_no: string
}

type FlightStore = {
  searchQuery: SearchQuery | null
  selectedFlight: Flight | null
  selectedSeat: Seat | null
  currentStep: BookingStep
  passengerForm: PassengerForm | null

  setSearchQuery: (q: SearchQuery) => void
  setSelectedFlight: (f: Flight) => void
  setSelectedSeat: (s: Seat) => void
  setCurrentStep: (step: BookingStep) => void
  setPassengerForm: (p: PassengerForm) => void
  resetStore: () => void
}

const initialState = {
  searchQuery: null,
  selectedFlight: null,
  selectedSeat: null,
  currentStep: 'search' as BookingStep,
  passengerForm: null,
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedFlight: (f) => set({ selectedFlight: f }),
      setSelectedSeat: (s) => set({ selectedSeat: s }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setPassengerForm: (p) => set({ passengerForm: p }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'flight-store',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        currentStep: state.currentStep,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        passengerForm: state.passengerForm
          ? {
              full_name: state.passengerForm.full_name,
              nationality: state.passengerForm.nationality,
              dob: state.passengerForm.dob,
            }
          : null,
      }),
    }
  )
)