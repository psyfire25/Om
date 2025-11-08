import '../globals.css';
import Link from 'next/link';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

export async function generateStaticParams() { return locales.map(l => ({ lang: l })); }

export default function LangLayout({ children, params }: { children: React.ReactNode, params: { lang: Locale } }) {
  const lang = params.lang ?? defaultLocale;
  return (
    <html lang={lang}>
      <body>
        <header>
          <nav>
            <strong className="brand">{process.env.SITE_NAME || 'Mas del Om'}</strong>
            <Link href={`/${lang}/admin`}>Dashboard</Link>
            <div className="grow" />
            <form onChange={(e)=>{ const sel = e.target as HTMLSelectElement; const to = location.pathname.replace(/^\/(en|es|ca|fr|it)/, '/' + sel.value); location.href = to; }}>
              <select className="lang" defaultValue={lang}>
                {locales.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </form>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
