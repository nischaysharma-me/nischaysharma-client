import React from 'react';
import AboutClient from '@/components/AboutClient';
import { usersService } from '@/services/users.service';
import { Metadata } from 'next';

export const revalidate = 3600; // Cache for 1 hour

export const metadata: Metadata = {
  title: "About Nischay Sharma | Lead Developer & Architect",
  description: "Learn about Nischay Sharma, a lead developer specializing in scalable backend systems, cloud-native architectures, and AI orchestration.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: "About Nischay Sharma | Lead Developer & Architect",
    description: "Learn about Nischay Sharma, a lead developer specializing in scalable backend systems, cloud-native architectures, and AI orchestration.",
    url: "https://nischaysharma.com/about",
    type: "profile",
    firstName: "Nischay",
    lastName: "Sharma",
    username: "nishuns",
  }
};

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

  return <AboutClient profile={profile} showBanner={true} />;
}
