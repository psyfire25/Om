'use client';
import { usePathname, useRouter } from 'next/navigation';

const FLAGS: Record<string, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  ca: '🏴‍☠️', // swap if you have a Catalan flag image; emoji support varies
  fr: '🇫🇷',
  it: '🇮🇹',
};

const LOCALES = ['en', 'es', 'ca', 'fr', 'it'] as const;

function swapLangInPath(path: string, next: string) {
  const m = path.match(/^\/(en|es|ca|fr|it)(\/.*)?$/i);
  if (!m) return `/${next}`;
  return `/${next}${m[2] || ''}`;
}

export default function FlagSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {LOCALES.map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            aria-label={l}
            title={l.toUpperCase()}
            className={`icon-btn ${active ? 'active' : ''}`}
            onClick={() => router.push(swapLangInPath(pathname, l))}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{FLAGS[l]}</span>
          </button>
        );
      })}
    </div>
  );
}