import React from 'react';
import HomeClient from '@/components/HomeClient';
import { getHomeDataAction } from '@/lib/actions/users';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Nischay Sharma - For Downtime & Inspiration",
  description: "Minimalist portfolio and magazine for Nischay Sharma. Explore technical stories, documentation, and curated collections.",
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
