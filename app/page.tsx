import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getHomeDataAction } from '@/lib/actions/users';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Nischay Sharma | Portfolio, Technical Writing & Inspiration",
  description: "Minimalist portfolio and magazine for Nischay Sharma. Explore technical stories, documentation, and curated collections.",
  keywords: ["Nischay Sharma", "Nishchay Sharma", "Nischay", "Nishchay", "Edvanta", "Thoughtjumper", "Thought Jumper", "TaughtCode", "Software Engineering", "Minimalist Portfolio", "Technical Writing"],
  alternates: {
    canonical: '/',
  },
};

// This is a Server Component
export default async function Home() {
  const response = await getHomeDataAction();
  const data = ('data' in response && response.success) ? response.data : { profile: null, featured: [] };

  return <HomeClient profile={data.profile} featured={data.featured} />;
}
