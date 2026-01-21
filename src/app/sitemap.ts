import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hagangol.com.ar'

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'always', // Home page with live matches changes constantly
      priority: 1,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // We can add dynamic routes for leagues here later if needed
  ]
}
