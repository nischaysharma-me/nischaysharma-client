import { PERSON_ID, SITE_URL, plainText, socialProfileUrls, type PublicSocialLinks } from './identity';

type Profile = {
  displayName?: string;
  occupation?: string;
  bio?: string;
  photoURL?: string;
  skills?: string[];
  expertise?: string[];
  socialLinks?: PublicSocialLinks;
  experience?: Array<{ company?: string }>;
  education?: Array<{ school?: string }>;
};

export function buildPerson(profile?: Profile | null) {
  const affiliations = [...new Set((profile?.experience || []).map(item => item.company).filter(Boolean))];
  const alumni = [...new Set((profile?.education || []).map(item => item.school).filter(Boolean))];
  const topics = [...new Set([...(profile?.expertise || []), ...(profile?.skills || [])].filter(Boolean))];

  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile?.displayName || 'Nischay Sharma',
    alternateName: ['Nishchay Sharma', 'Nischay', 'Nishchay', 'nischaysharma-me', 'nischay.me', 'Iamnischaysharma'],
    url: `${SITE_URL}/about`,
    mainEntityOfPage: `${SITE_URL}/about`,
    identifier: 'nischaysharma-me',
    jobTitle: profile?.occupation || 'Software Engineer & Creator',
    description: plainText(profile?.bio) || 'Nischay Sharma is a software engineer, architect, creator, and technical writer.',
    image: profile?.photoURL || `${SITE_URL}/og-image.jpg`,
    sameAs: socialProfileUrls(profile?.socialLinks),
    ...(affiliations.length ? {
      affiliation: affiliations.map(name => ({ '@type': 'Organization', name })),
    } : {}),
    ...(alumni.length ? {
      alumniOf: alumni.map(name => ({ '@type': 'EducationalOrganization', name })),
    } : {}),
    ...(topics.length ? { knowsAbout: topics } : {}),
  };
}

export function buildProfilePage(profile?: Profile | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/about#profile-page`,
    url: `${SITE_URL}/about`,
    name: `About ${profile?.displayName || 'Nischay Sharma'}`,
    mainEntity: buildPerson(profile),
    primaryImageOfPage: profile?.photoURL || `${SITE_URL}/og-image.jpg`,
  };
}
