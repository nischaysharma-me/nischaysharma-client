import React from 'react';
import AboutClient from '@/components/AboutClient';
import { usersService } from '@/services/users.service';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import { buildProfilePage } from '@/lib/seo/person';
import { plainText } from '@/lib/seo/identity';

export const revalidate = 60; // Cache for 1 minute

export async function generateMetadata(): Promise<Metadata> {
  let profile: Parameters<typeof buildProfilePage>[0] = null;
  try {
    const res = await usersService.getPublicAdmin();
    if (res?.success) profile = res.data;
  } catch {}
  const description = plainText(profile?.bio).slice(0, 155) || "Official profile of Nischay Sharma, a software engineer and architect specializing in scalable systems, cloud architecture, and AI orchestration.";
  const image = profile?.photoURL || '/og-image.jpg';
  return {
    title: "About Nischay Sharma | Official Profile",
    description,
    keywords: ["Nischay Sharma", "Nishchay Sharma", "Nischay", "Nishchay", "nischaysharma-me", "nischay.me", "Iamnischaysharma", "Edvanta", "Thoughtjumper", "Thought Jumper", "TaughtCode", "Software Engineering", "Technical Writing"],
    alternates: {
      canonical: '/about',
    },
    openGraph: {
      title: "About Nischay Sharma | Official Profile",
      description,
      url: "https://nischaysharma.com/about",
      type: "profile",
      firstName: "Nischay",
      lastName: "Sharma",
      username: "nischaysharma-me",
      images: [{ url: image, alt: 'Portrait of Nischay Sharma' }],
    },
    twitter: { card: 'summary_large_image', title: 'Nischay Sharma — Official Profile', description, images: [image] },
  };
}

export default async function AboutPage() {
  let profile = null;
  try {
    const res = await usersService.getPublicAdmin();
    if (res && res.success) {
      profile = res.data;
    }
  } catch (err) {
    console.error('Error fetching public admin profile:', err);
  }

  return <><StructuredData data={buildProfilePage(profile)} /><AboutClient profile={profile} showBanner={true} /></>;
}
