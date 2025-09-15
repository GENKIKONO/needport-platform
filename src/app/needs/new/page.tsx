import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import NewNeedForm from './components/NewNeedForm';

// Force dynamic rendering for authentication check
export const dynamic = 'force-dynamic';

export default async function NewNeedPage(){
  // Server-side authentication gate
  const { userId } = await auth();
  
  if (!userId) {
    // Redirect to sign-in with return URL
    redirect('/sign-in?redirect_url=' + encodeURIComponent('/needs/new'));
  }

  // Only authenticated users see this
  return <NewNeedForm />;
}