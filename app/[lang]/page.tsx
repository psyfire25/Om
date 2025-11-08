import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
export default function Home({ params }:{ params:{ lang: Locale }}) {
  redirect(`/${params.lang}/dashboard`);
}

