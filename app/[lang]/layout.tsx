import "../../styles/globals.css";
import Link from "next/link";
import { locales, defaultLocale, type Locale } from "../../lib/i18n";
import LangSwitcher from "../../components/LangSwitcher";
import LogoutButton from "@/components/LogoutButton";

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
            <LogoutButton lang={lang} />
            <Link href={`/${lang}/admin`}>Dashboard</Link>
            <div className="grow" />
            <LangSwitcher lang="en" />
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
