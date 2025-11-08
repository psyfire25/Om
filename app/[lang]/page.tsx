import Link from 'next/link';
import { t, type Locale } from '@/lib/i18n';

export default function Home({ params }: { params: { lang: Locale } }) {
  return (
    <div className="card">
      <h2>Mas del Om — Internal Ops</h2>
      <p><Link href={`/${params.lang}/admin`}>{t(params.lang,'dashboard')}</Link></p>
    </div>
  );
}
