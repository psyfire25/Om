'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';

export default function Sidebar({ lang }: { lang: Locale }){
  const p = usePathname();
  const items = [
    { href: `/${lang}/admin`, icon: '📁', label: t(lang,'projects') },
    { href: `/${lang}/admin#tasks`, icon: '✅', label: t(lang,'tasks') },
    { href: `/${lang}/admin#materials`, icon: '🧰', label: t(lang,'materials') },
    { href: `/${lang}/admin#logs`, icon: '📓', label: t(lang,'logs') },
    { href: `/${lang}/admin/super`, icon: '👑', label: t(lang,'usersInvites') },
  ];
  return (
    <aside className="sidebar">
      <ul className="tree">
        {items.map(it => {
          const active = p === it.href;
          return <li key={it.href}><Link className={active?'active':''} href={it.href}><span>{it.icon}</span><span>{it.label}</span></Link></li>
        })}
      </ul>
    </aside>
  );
}
