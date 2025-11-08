"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ lang = "en" }: { lang?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(`/${lang}/login`);
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="ghost"
      style={{ minWidth: 120 }}
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
