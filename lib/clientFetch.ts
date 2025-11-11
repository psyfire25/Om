export async function patchJson(path: string, body: any) {
    const res = await fetch(path, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  export async function getJson<T=any>(path: string): Promise<T> {
    const r = await fetch(path);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  export async function deleteJson(path: string) {
    const res = await fetch(path, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  export async function postJson(path: string, body: any) {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }