# ✈️ FlightApp — Flight Management Web App

A full-stack flight booking web application built with Next.js 14, Supabase, and Zustand.

## 🔗 Live Demo
[https://flight-app-gules-beta.vercel.app/]

## 🧪 Test Account
- Email: test@test.com
- Password: test1234

## 🛠️ Tech Stack
- **Frontend & API:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Realtime)
- **State Management:** Zustand with persist middleware
- **Styling:** Tailwind CSS

## 🚀 Local Setup

1. Clone the repository
```bash
git clone https://github.com/NarendraXD/flight-app.git
cd flight-app
Install dependencies
Bash
Create .env.local from example
Bash
Fill in your Supabase credentials in .env.local
Run the development server
Bash
🗄️ Supabase Setup
Create a new Supabase project
Run migration files in order from /supabase/migrations/
01_tables.sql — creates all 5 tables
02_rls.sql — enables Row Level Security
03_functions.sql — seat lock RPC + cancellation trigger
Run the seed script to populate flights and seats
Disable email confirmation in Authentication settings
📦 Zustand Store Structure
useFlightStore
Manages the entire booking flow:
searchQuery — origin, destination, date, passenger count
selectedFlight — the flight the user picked
selectedSeat — the seat the user selected
currentStep — tracks booking progress
passengerForm — passenger details
Persistence: Uses partialize to exclude passport_no from localStorage for security.
Reset: resetStore() is called on booking cancellation and logout.
useUserStore
Manages authentication:
session — Supabase auth session
cachedBookings — user's bookings
Persistence: Only the session token is persisted, not full booking data.
🏗️ Key Features
Seat Lock RPC — prevents double-booking using PostgreSQL FOR UPDATE lock
Cancellation Trigger — DB-level trigger blocks cancellations within 2 hours of departure
Realtime Seat Updates — Supabase Realtime syncs seat availability live
Row Level Security — users can only access their own bookings
⚠️ Trade-offs & Known Limitations
PWA bonus task not implemented due to time constraints
Reschedule does not reassign seat on new flight
No email notifications for booking confirmation
