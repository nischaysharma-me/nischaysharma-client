import { auth } from './firebase';

/**
 * Helper to get the current user's ID token.
 */
export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

/**
 * Helper to get the current user.
 */
export function getCurrentUser() {
  return auth.currentUser;
}
