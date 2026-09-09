import { articlesService } from '@/services/articles.service';
import { plainText, SITE_URL } from '@/lib/seo/identity';

export const revalidate = 3600;

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export async function GET() {
  let articles: Array<{ title: string; slug: string; description?: string; publishedAt?: string }> = [];
  try {
    const response = await articlesService.getTopArticles(100);
    if (response?.success && Array.isArray(response.data)) articles = response.data;
  } catch (error) {
    console.error('RSS feed: Failed to fetch articles:', error);
  }

  const items = articles.map(article => {
    const url = `${SITE_URL}/articles/${article.slug}`;
    const published = article.publishedAt ? new Date(article.publishedAt) : null;
    return [
      '<item>',
      `<title>${escapeXml(article.title)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      article.description ? `<description>${escapeXml(plainText(article.description))}</description>` : '',
      published && !Number.isNaN(published.getTime()) ? `<pubDate>${published.toUTCString()}</pubDate>` : '',
      '<author>Nischay Sharma</author>',
      '</item>',
    ].filter(Boolean).join('');
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Nischay Sharma — Articles</title><link>${SITE_URL}/articles</link><description>Technical writing, software architecture, AI, and engineering articles by Nischay Sharma.</description><language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
