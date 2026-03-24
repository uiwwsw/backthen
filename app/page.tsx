import { redirect } from 'next/navigation';
import { getDefaultYearsAgo } from '@/lib/year';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  redirect(`/${getDefaultYearsAgo()}`);
}
