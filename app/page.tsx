import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center px-4">
      <div className="text-center text-white mb-10">
        <h1 className="text-4xl font-bold mb-3">✈️ FlightApp</h1>
        <p className="text-blue-200 text-lg">Search, book, and manage your flights</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Where do you want to go?</h2>

        <div className="space-y-4">
          <Link
            href="/search"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Search Flights
          </Link>

          <Link
            href="/bookings"
            className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            My Bookings
          </Link>

          <Link
            href="/auth/login"
            className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Sign out / Switch account
          </Link>
        </div>
      </div>
    </main>
  )
}