'use client'

import React from 'react'

interface RoundSelectorProps {
  rounds: string[] // Lista de jornadas disponibles
  currentRound: string // Jornada actual seleccionada
  onRoundChange: (round: string) => void // Callback cuando cambia la jornada
}

/**
 * RoundSelector - Navegación de jornadas/rounds
 *
 * Muestra navegación tipo "◄ Jornada 10 ►" para cambiar entre jornadas
 *
 * @example
 * ```tsx
 * <RoundSelector
 *   rounds={["Jornada 1", "Jornada 2", "Jornada 3"]}
 *   currentRound="Jornada 2"
 *   onRoundChange={(round) => console.log(round)}
 * />
 * ```
 */
export function RoundSelector({
  rounds,
  currentRound,
  onRoundChange,
}: RoundSelectorProps) {
  if (rounds.length === 0) {
    return null
  }

  const currentIndex = rounds.indexOf(currentRound)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < rounds.length - 1

  const handlePrevious = () => {
    if (hasPrevious) {
      onRoundChange(rounds[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (hasNext) {
      onRoundChange(rounds[currentIndex + 1])
    }
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Botón Anterior */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={!hasPrevious}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all ${
          hasPrevious
            ? 'border-[#8a6d3b] bg-[#2c241b] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a120b]'
            : 'cursor-not-allowed border-[#8a6d3b]/30 bg-[#1a120b] text-[#8a6d3b]/30'
        }`}
        aria-label="Jornada anterior"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Jornada actual */}
      <div className="min-w-[200px] text-center">
        <div className="text-lg font-bold text-[#c5a059] uppercase font-oswald tracking-widest">{currentRound}</div>
        <div className="text-xs text-[#e6c885] font-mono">
          {currentIndex + 1} / {rounds.length}
        </div>
      </div>

      {/* Botón Siguiente */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!hasNext}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all ${
          hasNext
            ? 'border-[#8a6d3b] bg-[#2c241b] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a120b]'
            : 'cursor-not-allowed border-[#8a6d3b]/30 bg-[#1a120b] text-[#8a6d3b]/30'
        }`}
        aria-label="Jornada siguiente"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
