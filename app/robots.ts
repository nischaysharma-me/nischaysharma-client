import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const publicAccess = {
    allow: '/',
    disallow: ['/admin/', '/api/'],
  };

  return {
    rules: [
      { userAgent: '*', ...publicAccess },
      { userAgent: 'Googlebot', ...publicAccess },
      { userAgent: 'bingbot', ...publicAccess },
      { userAgent: 'OAI-SearchBot', ...publicAccess },
      { userAgent: 'ChatGPT-User', ...publicAccess },
      { userAgent: 'PerplexityBot', ...publicAccess },
    ],
    sitemap: 'https://nischaysharma.com/sitemap.xml',
    host: 'https://nischaysharma.com',
  };
}
