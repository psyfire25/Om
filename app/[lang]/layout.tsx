import "../../styles/globals.css";
import Link from "next/link";
import Image from "next/image";
import { locales, defaultLocale, type Locale } from "../../lib/i18n";
import ClientShell from "../../components/ClientShell";
import FlagSwitcher from "../../components/FlagSwitcher"; // 👈 new compact switcher

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
      <head>
        {/* Use your public icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <title>{process.env.SITE_NAME || "Mas de L'Om"}</title>
      </head>
      <body>
        <header>
          <nav>
            <Link href={`/${lang}/dashboard`} className="brand" aria-label="Home">
              {/* Swap to your real filenames in /public (svg or png) */}
              <Image
                src="/logo.png"
                alt="Mas de L'Om"
                width={28}
                height={28}
                priority
                style={{ verticalAlign: "middle" }}
              />
              <span className="brand-text">{process.env.SITE_NAME || "Mas de L'Om"}</span>
            </Link>

            <Link href={`/${lang}/admin`}>Dashboard</Link>

            <div className="grow" />

            {/* compact flag switcher */}
            <FlagSwitcher lang={lang} />
          </nav>
        </header>

        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}