'use client'

import { useState } from 'react'

type Category = 'hotels' | 'restaurants' | 'attractions'

type HotelBooking = {
  hotelName: string
  checkIn: string
  checkOut: string
  guests: number
  name: string
  phone: string
}

const CITY_GUIDE: Record<string, Record<Category, { name: string; description: string; rating: string; image: string; price?: string }[]>> = {
  Mumbai: {
    hotels: [
      { name: 'The Taj Mahal Palace', description: 'Iconic luxury hotel overlooking Gateway of India', rating: '⭐ 5.0', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&q=80', price: '₹25,000/night' },
      { name: 'Trident Nariman Point', description: 'Business hotel with stunning sea views', rating: '⭐ 4.8', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', price: '₹12,000/night' },
      { name: 'Hotel Marine Plaza', description: 'Mid-range hotel on Marine Drive', rating: '⭐ 4.2', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80', price: '₹6,000/night' },
    ],
    restaurants: [
      { name: 'Trishna', description: 'Famous for coastal seafood and butter garlic crab', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80' },
      { name: 'Leopold Cafe', description: 'Historic cafe in Colaba, great for breakfast', rating: '⭐ 4.3', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80' },
      { name: 'Bademiya', description: 'Iconic street food — seekh kebabs and rolls', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&q=80' },
    ],
    attractions: [
      { name: 'Gateway of India', description: 'Historic arch monument by the Arabian Sea', rating: '⭐ 4.8', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80' },
      { name: 'Marine Drive', description: 'Scenic 3.6km promenade along the coast', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80' },
      { name: 'Elephanta Caves', description: 'UNESCO World Heritage cave temples', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=400&q=80' },
    ],
  },
  Delhi: {
    hotels: [
      { name: 'The Imperial New Delhi', description: 'Colonial-era luxury hotel in Connaught Place', rating: '⭐ 4.9', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', price: '₹20,000/night' },
      { name: 'Taj Hotel & Convention Centre', description: 'Modern luxury near Dwarka', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', price: '₹15,000/night' },
      { name: 'Hotel Palace Heights', description: 'Budget-friendly near Connaught Place', rating: '⭐ 4.1', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80', price: '₹4,500/night' },
    ],
    restaurants: [
      { name: "Karim's", description: 'Legendary Mughlai food near Jama Masjid since 1913', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { name: 'Indian Accent', description: 'Modern Indian fine dining, world-class menu', rating: '⭐ 4.8', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
      { name: 'Paranthe Wali Gali', description: 'Famous lane of stuffed parathas in Chandni Chowk', rating: '⭐ 4.4', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
    ],
    attractions: [
      { name: 'Red Fort', description: 'UNESCO World Heritage Mughal fortress', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80' },
      { name: 'Qutub Minar', description: 'Tallest brick minaret in the world', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80' },
      { name: 'India Gate', description: 'War memorial and iconic landmark', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=400&q=80' },
    ],
  },
  Bangalore: {
    hotels: [
      { name: 'The Leela Palace', description: 'Ultra-luxury hotel with royal interiors', rating: '⭐ 4.9', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80', price: '₹18,000/night' },
      { name: 'ITC Windsor', description: 'Heritage luxury hotel in the city center', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80', price: '₹10,000/night' },
      { name: 'Ibis Bangalore', description: 'Affordable modern hotel near MG Road', rating: '⭐ 4.2', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&q=80', price: '₹3,500/night' },
    ],
    restaurants: [
      { name: 'MTR (Mavalli Tiffin Room)', description: 'Legendary South Indian breakfast since 1924', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
      { name: 'Toit Brewpub', description: 'Best craft beer and food in Bangalore', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },
      { name: 'Vidyarthi Bhavan', description: 'Famous for crispy masala dosas since 1943', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
    ],
    attractions: [
      { name: 'Lalbagh Botanical Garden', description: '240-acre garden with 1,800+ plant species', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=400&q=80' },
      { name: 'Bangalore Palace', description: 'Tudor-style royal palace with beautiful gardens', rating: '⭐ 4.4', image: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=400&q=80' },
      { name: 'Cubbon Park', description: 'Green lung of Bangalore, perfect for morning walks', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&q=80' },
    ],
  },
  Kolkata: {
    hotels: [
      { name: 'The Oberoi Grand', description: 'Colonial grand dame of Kolkata hospitality', rating: '⭐ 4.8', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', price: '₹14,000/night' },
      { name: 'ITC Royal Bengal', description: 'Modern luxury in the heart of the city', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80', price: '₹11,000/night' },
      { name: 'Hotel Hindustan International', description: 'Classic mid-range hotel in Chowringhee', rating: '⭐ 4.1', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80', price: '₹4,000/night' },
    ],
    restaurants: [
      { name: 'Peter Cat', description: 'Famous for Chelo Kebab, a Kolkata institution', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80' },
      { name: 'Kewpies Kitchen', description: 'Authentic Bengali home-style cooking', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' },
      { name: "Balwant Singh's", description: 'Best mutton curry and parathas since 1942', rating: '⭐ 4.4', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
    ],
    attractions: [
      { name: 'Victoria Memorial', description: 'Stunning white marble monument and museum', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&q=80' },
      { name: 'Howrah Bridge', description: 'Iconic cantilever bridge over the Hooghly River', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&q=80' },
      { name: 'Dakshineswar Temple', description: 'Famous Hindu temple on the Hooghly riverbank', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1624461050280-afc5b8f33b48?w=400&q=80' },
    ],
  },
  Chennai: {
    hotels: [
      { name: 'ITC Grand Chola', description: 'Largest LEED Platinum hotel in the world', rating: '⭐ 4.9', image: 'https://images.unsplash.com/photo-1606046604972-77cc76aab31a?w=400&q=80', price: '₹16,000/night' },
      { name: 'The Leela Palace Chennai', description: 'Beachside luxury on the Bay of Bengal', rating: '⭐ 4.8', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80', price: '₹13,000/night' },
      { name: 'Hotel Palmgrove', description: 'Budget-friendly near Marina Beach', rating: '⭐ 4.0', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80', price: '₹3,500/night' },
    ],
    restaurants: [
      { name: 'Murugan Idli Shop', description: 'Best idlis and chutneys in Tamil Nadu', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
      { name: 'Peshawri (ITC)', description: 'North-West Frontier cuisine, legendary dal bukhara', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80' },
      { name: 'Ratna Cafe', description: 'Classic South Indian breakfast since 1948', rating: '⭐ 4.4', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
    ],
    attractions: [
      { name: 'Marina Beach', description: 'Second longest urban beach in the world', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
      { name: 'Kapaleeshwarar Temple', description: 'Ancient Dravidian-style Shiva temple in Mylapore', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1624461050280-afc5b8f33b48?w=400&q=80' },
      { name: 'Fort St. George', description: 'First English fortress in India, built in 1644', rating: '⭐ 4.4', image: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=400&q=80' },
    ],
  },
  Hyderabad: {
    hotels: [
      { name: 'Taj Falaknuma Palace', description: 'Former Nizam palace turned ultra-luxury hotel', rating: '⭐ 5.0', image: 'https://images.unsplash.com/photo-1548018560-c7196548fd9c?w=400&q=80', price: '₹30,000/night' },
      { name: 'ITC Kohenur', description: 'Luxury hotel in HITEC City business district', rating: '⭐ 4.7', image: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=400&q=80', price: '₹12,000/night' },
      { name: 'Hotel Golkonda', description: 'Classic mid-range hotel near Hussain Sagar', rating: '⭐ 4.1', image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&q=80', price: '₹4,000/night' },
    ],
    restaurants: [
      { name: 'Paradise Biryani', description: 'World-famous Hyderabadi dum biryani since 1953', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
      { name: 'Shah Ghouse Cafe', description: 'Authentic Hyderabadi cuisine near Charminar', rating: '⭐ 4.5', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
      { name: 'Bawarchi', description: 'Legendary biryani and kebabs in RTC X Roads', rating: '⭐ 4.4', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80' },
    ],
    attractions: [
      { name: 'Charminar', description: 'Iconic 16th century mosque and monument', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80' },
      { name: 'Golconda Fort', description: 'Medieval fortress with acoustic clapping trick', rating: '⭐ 4.6', image: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=400&q=80' },
      { name: 'Hussain Sagar Lake', description: 'Heart-shaped lake with Buddha statue island', rating: '⭐ 4.4', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&q=80' },
    ],
  },
}

const CATEGORY_ICONS: Record<Category, string> = {
  hotels: '🏨',
  restaurants: '🍽️',
  attractions: '🗺️',
}

type Props = {
  city: string
  flightDate?: string
}

export default function TravelGuide({ city, flightDate }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('hotels')
  const [expanded, setExpanded] = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [bookingHotel, setBookingHotel] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<HotelBooking | null>(null)

  // form state
  const [checkIn, setCheckIn] = useState(flightDate || '')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState('')

  const guide = CITY_GUIDE[city]
  if (!guide) return null

  function handleBookHotel() {
    if (!guestName || !checkIn || !checkOut || !phone) {
      setFormError('Please fill in all fields')
      return
    }
    if (checkOut <= checkIn) {
      setFormError('Check-out must be after check-in')
      return
    }
    setConfirmed({
      hotelName: bookingHotel!,
      checkIn,
      checkOut,
      guests,
      name: guestName,
      phone,
    })
    setBookingHotel(null)
    setFormError('')
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div className="text-left">
            <p className="text-white font-semibold">Explore {city}</p>
            <p className="text-blue-300 text-xs">Hotels · Restaurants · Attractions</p>
          </div>
        </div>
        <span className={`text-blue-300 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Hotel booking confirmed banner */}
      {confirmed && (
        <div className="mx-5 mb-4 bg-green-500/20 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 font-semibold text-sm mb-1">🎉 Hotel Booked!</p>
          <p className="text-white text-sm">{confirmed.hotelName}</p>
          <p className="text-blue-300 text-xs mt-1">
            {confirmed.checkIn} → {confirmed.checkOut} · {confirmed.guests} guest{confirmed.guests > 1 ? 's' : ''}
          </p>
          <p className="text-blue-300 text-xs">Guest: {confirmed.name} · {confirmed.phone}</p>
          <button
            onClick={() => setConfirmed(null)}
            className="mt-2 text-xs text-blue-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {expanded && (
        <div className="px-5 pb-5">

          {/* Category tabs */}
          <div className="flex gap-2 mb-4">
            {(Object.keys(CATEGORY_ICONS) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
                  activeCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="space-y-3">
            {guide[activeCategory].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all"
              >
                {/* Image */}
                {!imgErrors[item.name] ? (
                  <div className="relative w-full h-36">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgErrors((prev) => ({ ...prev, [item.name]: true }))}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 right-2 text-xs text-yellow-400 font-medium bg-black/40 px-2 py-0.5 rounded-full">
                      {item.rating}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-36 bg-white/10 flex items-center justify-center text-3xl">
                    {CATEGORY_ICONS[activeCategory]}
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    {item.price && (
                      <span className="text-xs text-green-400 whitespace-nowrap font-medium">{item.price}</span>
                    )}
                  </div>
                  <p className="text-blue-300 text-xs mt-0.5 mb-3">{item.description}</p>

                  {/* Book button for hotels only */}
                  {activeCategory === 'hotels' && (
                    <button
                      onClick={() => { setBookingHotel(item.name); setFormError('') }}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 hover:text-white py-2 rounded-lg text-xs font-medium transition-all"
                    >
                      🏨 Book This Hotel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotel booking modal */}
      {bookingHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="backdrop-blur-xl bg-[#0a0f1e] border border-white/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Book Hotel</h2>
            <p className="text-blue-300 text-sm mb-4">{bookingHotel} · {city}</p>

            {formError && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-2 rounded-lg mb-3">
                {formError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">Guests</label>
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="text-white bg-white/20 hover:bg-white/30 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-white text-sm">
                    {guests} guest{guests > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setGuests(Math.min(10, guests + 1))}
                    className="text-white bg-white/20 hover:bg-white/30 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setBookingHotel(null); setFormError('') }}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBookHotel}
                className="flex-1 bg-blue-500 hover:bg-blue-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}