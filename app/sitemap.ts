import { MetadataRoute } from 'next';
import { articlesService } from '@/services/articles.service';
import { docsService } from '@/services/docs.service';
import { usersService } from '@/services/users.service';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nischaysharma.com';

  let portrait = `${baseUrl}/og-image.jpg`;
  try {
    const profileRes = await usersService.getPublicAdmin();
    if (profileRes?.success && profileRes.data?.photoURL) portrait = profileRes.data.photoURL;
  } catch (err) {
    console.error('Sitemap: Failed to fetch profile image:', err);
  }

  // Base routes
  const routes = [
    '',
    '/about',
    '/articles',
    '/posts',
    '/billboard',
    '/docs',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
    ...(['', '/about'].includes(route) ? { images: [portrait] } : {}),
  }));

  // Article routes
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articlesRes = await articlesService.listArticles({ status: 'published' });
    if (articlesRes.success && Array.isArray(articlesRes.data)) {
      articleRoutes = articlesRes.data.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.publishedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        ...(article.backgroundImage ? { images: [article.backgroundImage] } : {}),
      }));
    }
  } catch (err) {
    console.error('Sitemap: Failed to fetch articles:', err);
  }

  // Documentation routes
  let docRoutes: MetadataRoute.Sitemap = [];
  try {
    const docsNavRes = await docsService.getNavigation();
    if (docsNavRes.success && docsNavRes.data.navigation) {
      const allDocPaths: string[] = [];
      docsNavRes.data.navigation.forEach((section) => {
        section.items.forEach((item) => {
          allDocPaths.push(item.path);
        });
      });

      docRoutes = allDocPaths.map((path) => ({
        url: `${baseUrl}/docs/${path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }));
    }
  } catch (err) {
    console.error('Sitemap: Failed to fetch docs navigation:', err);
  }

  return [...routes, ...articleRoutes, ...docRoutes];
}
