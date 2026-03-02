import React from 'react';
import OrganizationClient from '@/components/OrganizationClient';

// Note: In a real app with Firebase, you'd pass a session cookie here.
// For now, we'll keep the client-side fetching logic inside the Client component
// but the structure follows the requested Server/Client separation.

export default function OrganizationPage() {
  // We do not pre-fetch here because the endpoint requires a valid auth token.
  // The client component will fetch the organizations using the Firebase token.
  const availableOrgs: any[] = [];

  return (
    <OrganizationClient 
      initialOrg={null} 
      availableOrgs={availableOrgs} 
    />
  );
}
