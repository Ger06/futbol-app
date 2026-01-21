import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hagangol.com.ar'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Disallow API routes from crawling
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
