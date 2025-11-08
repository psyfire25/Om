"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteAcceptPage({
  params,
}: {
  params: { lang: string; token: string };
}) {
  const { lang, token } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inv, setInv] = useState<{
    email?: string | null;
    role: string;
  } | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch(`/api/invites/${token}`);
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setErr(j?.error || "Invite invalid");
        setLoading(false);
        return;
      }
      setInv({ email: j.email ?? "", role: j.role });
      setLoading(false);
    })();
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch(`/api/invites/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    if (res.ok) router.push(`/${lang}/dashboard`);
    else {
      const j = await res.json().catch(() => null);
      setErr(j?.error || "Failed to accept invite");
    }
  }

  if (loading)
    return (
      <main>
        <p>Loading invite…</p>
      </main>
    );
  if (err)
    return (
      <main>
        <p style={{ color: "tomato" }}>{err}</p>
      </main>
    );

  return (
    <main style={{ maxWidth: 560, margin: "40px auto" }}>
      <h1>Join Mas del Om</h1>
      <p>
        Role: <b>{inv?.role}</b>
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input name="name" placeholder="Your name" required />
        <input
          name="email"
          type="email"
          placeholder="Email"
          defaultValue={inv?.email || ""}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Choose a password"
          required
        />
        <button className="primary">Create account</button>
      </form>
    </main>
  );
}
