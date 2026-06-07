'use client'

import { useState } from 'react'

type Props = {
  pnr: string
  flightNo: string
  origin: string
  destination: string
  departs_at: string
  arrives_at: string
  seatNumber: string
  seatClass: string
  passengerName: string
  totalPrice: number
}

export default function DownloadTicket(props: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)

    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [150, 80] })

    // Background
    doc.setFillColor(10, 15, 30)
    doc.rect(0, 0, 150, 80, 'F')

    // Blue accent bar
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, 150, 12, 'F')

    // Header
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('✈ FlightApp — Boarding Pass', 75, 8, { align: 'center' })

    // PNR
    doc.setFontSize(9)
    doc.setTextColor(147, 197, 253)
    doc.text('PNR', 10, 20)
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(props.pnr, 10, 28)

    // Flight number
    doc.setFontSize(9)
    doc.setTextColor(147, 197, 253)
    doc.text('FLIGHT', 60, 20)
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(props.flightNo, 60, 28)

    // Route
    doc.setFontSize(9)
    doc.setTextColor(147, 197, 253)
    doc.text('FROM', 10, 40)
    doc.text('TO', 60, 40)
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(props.origin.toUpperCase(), 10, 48)
    doc.text('→', 42, 48)
    doc.text(props.destination.toUpperCase(), 60, 48)

    // Times
    const depTime = new Date(props.departs_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const arrTime = new Date(props.arrives_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const depDate = new Date(props.departs_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

    doc.setFontSize(9)
    doc.setTextColor(147, 197, 253)
    doc.text('DEPARTS', 10, 58)
    doc.text('ARRIVES', 50, 58)
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text(depTime, 10, 65)
    doc.text(arrTime, 50, 65)
    doc.setFontSize(8)
    doc.setTextColor(147, 197, 253)
    doc.text(depDate, 10, 70)

    // Divider
    doc.setDrawColor(255, 255, 255)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(100, 14, 100, 75)

    // Right side
    doc.setFontSize(9)
    doc.setTextColor(147, 197, 253)
    doc.text('PASSENGER', 105, 20)
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(props.passengerName.toUpperCase(), 105, 27)

    doc.setFontSize(9)
    doc.setTextColor(147, 197, 253)
    doc.text('SEAT', 105, 37)
    doc.text('CLASS', 125, 37)
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(props.seatNumber, 105, 45)
    doc.setFontSize(11)
    doc.text(props.seatClass.toUpperCase(), 125, 45)

    doc.setFontSize(9)
    doc.setTextColor(147, 197, 253)
    doc.text('TOTAL PAID', 105, 55)
    doc.setFontSize(13)
    doc.setTextColor(96, 165, 250)
    doc.setFont('helvetica', 'bold')
    doc.text(`Rs. ${props.totalPrice.toLocaleString()}`, 105, 63)

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    doc.text('This is an electronic boarding pass. Present at check-in.', 75, 77, { align: 'center' })

    doc.save(`BoardingPass_${props.pnr}.pdf`)
    setLoading(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
    >
      {loading ? 'Generating...' : '📄 Download Boarding Pass'}
    </button>
  )
}