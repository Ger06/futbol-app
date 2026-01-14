'use client'

import React, { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import { PageLayout } from '@/shared/components/layout/PageLayout'
import { Card } from '@/shared/components/ui/Card'

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.current) return

    setLoading(true)
    setStatus('idle')

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ''
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing')
      setStatus('error')
      setLoading(false)
      return
    }

    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey: publicKey,
      })
      .then(
        () => {
          setStatus('success')
          setLoading(false)
          form.current?.reset()
        },
        (error) => {
          console.error('FAILED...', error.text)
          setStatus('error')
          setLoading(false)
        }
      )
  }

  return (
    <PageLayout title="Contacto" description="¿Tenés dudas o sugerencias? Escribime.">
      <div className="mx-auto max-w-2xl px-4">
        <Card className="border-[#8a6d3b] bg-[#1a120b]/90 p-8 shadow-2xl relative overflow-hidden">
             {/* Decorative grunge overlay effect */}
             <div className="absolute inset-0 bg-[url('/textures/grunge.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
             
          <form ref={form} onSubmit={sendEmail} className="relative z-10 space-y-6">
            
            {/* Name Field */}
            <div>
              <label 
                  htmlFor="user_name" 
                  className="block mb-2 font-marker text-[#c5a059] uppercase tracking-wide"
              >
                Nombre
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-sm border-2 border-[#8a6d3b] bg-[#2c241b] px-4 py-3 text-[#f4f1ea] placeholder-[#e6c885]/30 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors font-oswald tracking-wide"
                placeholder="Tu nombre"
              />
            </div>

            {/* Email Field */}
            <div>
              <label 
                  htmlFor="email" 
                  className="block mb-2 font-marker text-[#c5a059] uppercase tracking-wide"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-sm border-2 border-[#8a6d3b] bg-[#2c241b] px-4 py-3 text-[#f4f1ea] placeholder-[#e6c885]/30 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors font-oswald tracking-wide"
                placeholder="tu@email.com"
              />
            </div>

            {/* Message Field */}
            <div>
              <label 
                  htmlFor="message" 
                  className="block mb-2 font-marker text-[#c5a059] uppercase tracking-wide"
              >
                Mensaje
              </label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full rounded-sm border-2 border-[#8a6d3b] bg-[#2c241b] px-4 py-3 text-[#f4f1ea] placeholder-[#e6c885]/30 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors font-oswald tracking-wide resize-none"
                placeholder="Escribe tu consulta o sugerencia aquí..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                group mt-4 flex w-full items-center justify-center space-x-2 
                rounded-sm bg-[#c5a059] px-6 py-4 
                font-marker text-lg uppercase tracking-widest text-[#1a120b] 
                transition-all hover:bg-[#e6c885] hover:scale-[1.02] active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            >
              {loading ? (
                <span className="animate-pulse">Enviando...</span>
              ) : (
                <>
                    <span>Enviar Mensaje</span>
                    <span className="transition-transform group-hover:translate-x-1">✉️</span>
                </>
              )}
            </button>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="mt-4 rounded-sm border-l-4 border-green-500 bg-green-900/40 p-4 text-green-200 animate-pulse-slow">
                <p className="font-bold font-oswald uppercase flex items-center gap-2">
                    <span>✅</span> Mensaje enviado correctamente
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 rounded-sm border-l-4 border-red-500 bg-red-900/40 p-4 text-red-200">
                <p className="font-bold font-oswald uppercase flex items-center gap-2">
                    <span>⚠️</span> Error al enviar. Intenta nuevamente.
                </p>
              </div>
            )}

          </form>
        </Card>
      </div>
    </PageLayout>
  )
}
