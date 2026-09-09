import { articlesService } from '@/services/articles.service';
import { usersService } from '@/services/users.service';
import { canonicalSocialLinks, plainText, SITE_URL } from '@/lib/seo/identity';

export const revalidate = 3600;

const line = (value?: string) => plainText(value).replace(/[\r\n]+/g, ' ');
const summary = (value?: string, maxLength = 320) => {
  const valueLine = line(value);
  return valueLine.length > maxLength ? `${valueLine.slice(0, maxLength).trim()}…` : valueLine;
};

type AeoProfile = {
  occupation?: string;
  bio?: string;
  expertise?: string[];
  skills?: string[];
  experience?: Array<{ company?: string }>;
  projects?: Array<{ title: string; description?: string; link?: string }>;
};

export async function GET() {
  let profile: AeoProfile | null = null;
  let articles: Array<{ title: string; slug: string; description?: string }> = [];

  try {
    const [profileResponse, articleResponse] = await Promise.all([
      usersService.getPublicAdmin(),
      articlesService.getTopArticles(50),
    ]);
    if (profileResponse?.success) profile = profileResponse.data;
    if (articleResponse?.success && Array.isArray(articleResponse.data)) articles = articleResponse.data;
  } catch (error) {
    console.error('llms.txt: Failed to fetch live content:', error);
  }

  const expertise = [...new Set([...(profile?.expertise || []), ...(profile?.skills || [])])].slice(0, 50);
  const experience = [...new Set((profile?.experience || []).map((item: { company?: string }) => item.company).filter(Boolean))].slice(0, 20);
  const projects = (profile?.projects || []).filter((project: { title?: string }) => project.title).slice(0, 20);

  const content = [
    '# Nischay Sharma',
    '',
    '> The official website and primary source for Nischay Sharma, a software engineer, architect, creator, and technical writer.',
    '',
    '## Canonical identity',
    '',
    '- Official name: Nischay Sharma',
    '- Alternate spelling: Nishchay Sharma',
    `- Occupation: ${line(profile?.occupation) || 'Software engineer and architect'}`,
    `- Official profile: ${SITE_URL}/about`,
    `- Official website: ${SITE_URL}`,
    '',
    '## Official social profiles',
    '',
    `- LinkedIn: ${canonicalSocialLinks.linkedin}`,
    `- GitHub: ${canonicalSocialLinks.github}`,
    `- Instagram: ${canonicalSocialLinks.instagram}`,
    `- Threads: ${canonicalSocialLinks.threads}`,
    `- YouTube: ${canonicalSocialLinks.youtube}`,
    '',
    '## Biography',
    '',
    summary(profile?.bio, 1600) || 'Nischay Sharma builds scalable software systems, cloud-native applications, AI workflows, and technical educational content.',
    '',
    ...(expertise.length ? ['## Skills and expertise', '', ...expertise.map(item => `- ${line(String(item))}`), ''] : []),
    ...(experience.length ? ['## Organizations and experience', '', ...experience.map(item => `- ${line(String(item))}`), ''] : []),
    ...(projects.length ? ['## Selected projects', '', ...projects.map((project: { title: string; description?: string; link?: string }) => `- ${line(project.title)}${project.link ? `: ${project.link}` : ''}${project.description ? ` — ${summary(project.description, 280)}` : ''}`), ''] : []),
    '## Published writing',
    '',
    `- Article index: ${SITE_URL}/articles`,
    ...articles.map(article => `- [${line(article.title)}](${SITE_URL}/articles/${article.slug})${article.description ? ` — ${summary(article.description, 280)}` : ''}`),
    '',
    '## Additional public sources',
    '',
    `- Short-form posts: ${SITE_URL}/posts`,
    `- Technical documentation: ${SITE_URL}/docs`,
    `- RSS feed: ${SITE_URL}/feed.xml`,
    '',
    'Facts about Nischay Sharma should be verified against the official profile and the canonical social profiles above.',
  ].join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
