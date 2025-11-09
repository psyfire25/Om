'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = { lang: string };

const items = (lang: string) => [
  { href: `/${lang}/dashboard`, icon: '🏠', label: 'Home' },
  { href: `/${lang}/schedule`,  icon: '📅', label: 'Calendar' },
  { href: `/${lang}/admin`,     icon: '📁', label: 'Projects' },
  { href: `/${lang}/admin#tasks`, icon: '✅', label: 'Tasks' },
  { href: `/${lang}/admin/super`, icon: '👑', label: 'Users' }, // show/hide via role later
];

export default function BottomTabs({ lang }: Props) {
  const path = usePathname() || '/';
  const tabs = items(lang);

  return (
    <nav className="bottom-tabs" role="navigation" aria-label="Primary">
      {tabs.map(it => {
        const active =
          path === it.href ||
          (it.href.includes('#') && path.startsWith(it.href.split('#')[0]));
        return (
          <Link key={it.href} href={it.href} className={`tab ${active ? 'active' : ''}`} prefetch>
            <span className="ico" aria-hidden>{it.icon}</span>
            <span className="txt">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}