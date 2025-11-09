import "../../styles/globals.css";
import Link from "next/link";
import { locales, defaultLocale, type Locale } from "../../lib/i18n";
import LangSwitcher from "../../components/LangSwitcher";
import ClientShell from "../../components/ClientShell"; // 👈 new wrapper

export async function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const lang = params.lang ?? defaultLocale;

  return (
    <html lang={lang}>
      <body>
        <header>
          <nav>
            <strong className="brand">
              {process.env.SITE_NAME || "Mas de L'Om"}
            </strong>
            <Link href={`/${lang}/admin`}>Dashboard</Link>
            <div className="grow" />
            <LangSwitcher lang={lang} />
          </nav>
        </header>

        {/* 👇 wrap client logic here */}
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}