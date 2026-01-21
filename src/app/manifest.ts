import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HaganGol'
  
  return {
    name: siteName,
    short_name: siteName,
    description: 'Resultados en vivo, fixtures y estadísticas de fútbol.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a120b',
    theme_color: '#c5a059',
    icons: [
      {
        src: '/logos/hagangol-icon-dark.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logos/hagangol-icon-dark.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
