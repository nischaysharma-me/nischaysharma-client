import React from 'react';
import BillboardClient from '@/components/BillboardClient';
import { listBillboardsAction } from '@/lib/actions/billboard';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "The Daily Digital | Billboard",
  description: "Explore the latest digital stories, lead articles, and updates in The Daily Digital broadsheet.",
  alternates: {
    canonical: '/billboard',
  },
  openGraph: {
    title: "The Daily Digital | Billboard",
    description: "Explore the latest digital stories, lead articles, and updates in The Daily Digital broadsheet.",
    url: "https://nischaysharma.com/billboard",
    type: "website",
  }
};

export default async function BillboardPage() {
  const response = await listBillboardsAction(undefined, true);
  const billboards = response.success ? response.data : [];

  return <BillboardClient billboards={billboards} />;
}
