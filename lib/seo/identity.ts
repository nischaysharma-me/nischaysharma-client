export const SITE_URL = 'https://nischaysharma.com';
export const PERSON_ID = `${SITE_URL}/about#nischay-sharma`;

export const canonicalSocialLinks = {
  github: 'https://github.com/nischaysharma-me',
  instagram: 'https://www.instagram.com/nischay.me/',
  linkedin: 'https://www.linkedin.com/in/nischaysharma-me',
  threads: 'https://www.threads.net/@nischay.me',
  youtube: 'https://www.youtube.com/@Iamnischaysharma',
} as const;

export type PublicSocialLinks = Partial<Record<
  'github' | 'instagram' | 'linkedin' | 'threads' | 'twitter' | 'website' | 'youtube',
  string
>>;

const legacySocialLinks: Record<string, string> = {
  'https://github.com/nishuns': canonicalSocialLinks.github,
  'https://instagram.com/nishuns': canonicalSocialLinks.instagram,
  'https://www.instagram.com/nishuns': canonicalSocialLinks.instagram,
  'https://linkedin.com/in/nischaysharma': canonicalSocialLinks.linkedin,
  'https://www.linkedin.com/in/nischaysharma': canonicalSocialLinks.linkedin,
};

const safeUrl = (value?: string) => {
  if (!value) return undefined;
  const normalized = legacySocialLinks[value.replace(/\/$/, '')] || value;
  try {
    const url = new URL(normalized);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

export function getPublicSocialLinks(links?: PublicSocialLinks): PublicSocialLinks {
  return {
    github: safeUrl(links?.github) || canonicalSocialLinks.github,
    instagram: safeUrl(links?.instagram) || canonicalSocialLinks.instagram,
    linkedin: safeUrl(links?.linkedin) || canonicalSocialLinks.linkedin,
    threads: safeUrl(links?.threads) || canonicalSocialLinks.threads,
    twitter: safeUrl(links?.twitter),
    website: safeUrl(links?.website),
    youtube: safeUrl(links?.youtube) || canonicalSocialLinks.youtube,
  };
}

export function socialProfileUrls(links?: PublicSocialLinks) {
  return [...new Set(Object.values(getPublicSocialLinks(links)).filter(Boolean))] as string[];
}

export function plainText(value?: string) {
  return (value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
