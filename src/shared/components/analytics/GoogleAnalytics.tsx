import Script from 'next/script'

/**
 * GoogleAnalytics - Componente para integrar Google Analytics 4
 *
 * Carga el script de GA4 solo si está configurado NEXT_PUBLIC_GA_MEASUREMENT_ID
 *
 * @example
 * ```tsx
 * // En layout.tsx
 * <body>
 *   <GoogleAnalytics />
 *   {children}
 * </body>
 * ```
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // No cargar GA si no está configurado
  if (!measurementId) {
    return null
  }

  return (
    <>
      {/* Google Analytics gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
