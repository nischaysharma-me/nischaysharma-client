import React from 'react';
import OrganizationClient from '@/components/OrganizationClient';
import { getAllOrganizationsAction } from '@/actions/organizations';

// Note: In a real app with Firebase, you'd pass a session cookie here.
// For now, we'll keep the client-side fetching logic inside the Client component
// but the structure follows the requested Server/Client separation.

export default async function OrganizationPage() {
  // We can still pre-fetch non-auth data on server
  const response = await getAllOrganizationsAction(''); // Empty token for server pre-fetch
  const availableOrgs = response.success ? response.data : [];

  return (
    <OrganizationClient 
      initialOrg={null} 
      availableOrgs={availableOrgs} 
    />
  );
}
