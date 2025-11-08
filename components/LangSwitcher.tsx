"use client";

import { locales, type Locale } from "../lib/i18n";
import { usePathname } from "next/navigation";

export default function LangSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    // replace the leading /{lang} segment with the new one
    const to = pathname.replace(/^\/(en|es|ca|fr|it)/, "/" + next);
    // hard navigate (safe for any route)
    window.location.href = to;
  }

  return (
    <select className="lang" defaultValue={lang} onChange={onChange}>
      {locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
