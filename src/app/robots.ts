import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/dashboard/*', '/api/*'],
    },
    sitemap: 'https://www.proventa.in/sitemap.xml',
  };
}
