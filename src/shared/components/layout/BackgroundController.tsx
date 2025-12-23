'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // Need to check if framer-motion is installed, if not will use simple CSS transition

// Mapping of routes to background classes/images
const getBackgroundForRoute = (pathname: string) => {
  if (pathname === '/') return 'bg-stadium'
  if (pathname.startsWith('/match')) return 'bg-pitch'
  if (pathname.startsWith('/leagues') || pathname.length > 2) return 'bg-locker' // Assuming other routes are leagues
  return 'bg-stadium' // Default
}

export function BackgroundController() {
  const pathname = usePathname()
  const [bgClass, setBgClass] = useState('bg-stadium')

  useEffect(() => {
    setBgClass(getBackgroundForRoute(pathname))
  }, [pathname])

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Base Layer (Global Grunge) */}
      <div className="absolute inset-0 bg-[#1a120b] bg-[url('/textures/grunge.png')] bg-cover opacity-100" />
      
      {/* Dynamic Layer with Framer Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgClass}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`absolute inset-0 bg-cover bg-center blend-overlay ${bgClass}`}
        />
      </AnimatePresence>

      {/* Vignette/Noise Overlay (Always on top) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000_100%)] opacity-80" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
    </div>
  )
}
