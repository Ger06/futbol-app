'use client'

import React, { useState, useEffect } from 'react'

export function WorldCupCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // 11 June 2026 13:00 CST (UTC-6) -> 19:00:00 UTC
    const targetDate = new Date('2026-06-11T19:00:00Z')

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mx-3 mb-6 overflow-hidden rounded-sm border-2 border-[#8a6d3b] bg-[#2c241b] shadow-lg">
      {/* Header del Countdown */}
      <div className="border-b border-[#8a6d3b] bg-[#c5a059] px-2 py-1 text-center">
        <h3 className="font-marker text-sm uppercase tracking-wider text-[#1a120b]">
          Mundial 2026
        </h3>
      </div>

      {/* Grid del tiempo */}
      <div className="grid grid-cols-4 gap-1 p-2 text-center">
        {/* Días */}
        <div className="flex flex-col items-center">
          <span className="font-oswald text-xl font-bold text-[#f4f1ea] drop-shadow-sm">
            {timeLeft.days}
          </span>
          <span className="text-[10px] uppercase text-[#c5a059]">Días</span>
        </div>

        {/* Horas */}
        <div className="flex flex-col items-center border-l border-[#8a6d3b]/30">
          <span className="font-oswald text-xl font-bold text-[#f4f1ea] drop-shadow-sm">
            {timeLeft.hours}
          </span>
          <span className="text-[10px] uppercase text-[#c5a059]">Hrs</span>
        </div>

        {/* Minutos */}
        <div className="flex flex-col items-center border-l border-[#8a6d3b]/30">
          <span className="font-oswald text-xl font-bold text-[#f4f1ea] drop-shadow-sm">
            {timeLeft.minutes}
          </span>
          <span className="text-[10px] uppercase text-[#c5a059]">Min</span>
        </div>

        {/* Segundos */}
        <div className="flex flex-col items-center border-l border-[#8a6d3b]/30">
          <span className="font-oswald text-xl font-bold text-[#e63946] drop-shadow-sm animate-pulse">
            {timeLeft.seconds}
          </span>
          <span className="text-[10px] uppercase text-[#c5a059]">Seg</span>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-[#1a120b] py-1 text-center">
        <p className="text-[9px] uppercase tracking-widest text-[#c5a059]/80">
          México • USA • Canadá
        </p>
      </div>
    </div>
  )
}
