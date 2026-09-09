import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getHomeDataAction } from '@/lib/actions/users';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import { buildPerson } from '@/lib/seo/person';
import { PERSON_ID, SITE_URL } from '@/lib/seo/identity';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export function generateMetadata(): Metadata {
  const image = '/og-image.jpg';
  const title = 'Nischay Sharma | Official Portfolio & Technical Writing';
  const description = 'Official portfolio of Nischay Sharma (also searched as Nishchay Sharma): software engineering, AI, technical writing, projects, and social profiles.';
  return {
    title,
    description,
    keywords: ["Nischay Sharma", "Nishchay Sharma", "Nischay", "Nishchay", "Edvanta", "Thoughtjumper", "Thought Jumper", "TaughtCode", "App Avengers", "Software Engineering", "Technical Writing"],
    alternates: { canonical: '/' },
    openGraph: { title, description, url: SITE_URL, type: 'website', images: [{ url: image, width: 1200, height: 630, alt: 'Nischay Sharma — AI Solution Architect and Technical Writer' }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

// This is a Server Component
export default async function Home() {
  const response = await getHomeDataAction();
  const data = ('data' in response && response.success) ? response.data : { profile: null, featured: [] };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: 'Nischay Sharma — Official Portfolio',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': PERSON_ID },
    author: buildPerson(data.profile),
    primaryImageOfPage: data.profile?.photoURL || `${SITE_URL}/og-image.jpg`,
  };

  return <><StructuredData data={jsonLd} /><HomeClient profile={data.profile} featured={data.featured} /></>;
}
