'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import Accordion from '@/components/Accordion';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import MaterialModal from '@/components/modals/MaterialModal';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function MaterialsPage({ params }:{ params:{ lang: Locale }}) {
  const lang = params.lang;
  const { data: materials = [], mutate: refetch } = useSWR('/api/materials', fetcher);
  const [materialId, setMaterialId] = useState<string|null>(null);

  async function post(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/materials',{ method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name: fd.get('name'),
        quantity: Number(fd.get('quantity')||0),
        unit: fd.get('unit'),
        location: fd.get('location'),
        notes: fd.get('notes')
      })
    });
    (e.currentTarget as HTMLFormElement).reset(); refetch();
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="columns">
        <div className="column">
          <Accordion title={t(lang,'materialsInventory')} defaultOpen>
            <form onSubmit={post} className="grid">
              <input name="name" placeholder="Name" required />
              <label>Qty <input type="number" name="quantity" defaultValue={0} /></label>
              <input name="unit" placeholder="Unit" />
              <input name="location" placeholder="Location" />
              <textarea name="notes" placeholder="Notes" />
              <button className="primary" type="submit">Add</button>
            </form>
            <table><thead><tr><th>Name</th><th>Qty</th><th>Unit</th><th>Location</th></tr></thead><tbody>
              {materials.map((m:any)=>(
                <tr key={m.id} className="clickable" onClick={()=>setMaterialId(m.id)}>
                  <td>{m.name}</td><td>{m.quantity}</td><td>{m.unit||'—'}</td><td>{m.location||'—'}</td>
                </tr>
              ))}
            </tbody></table>
          </Accordion>
        </div>
      </div>
      <MaterialModal open={!!materialId} id={materialId} onClose={()=>setMaterialId(null)} onSaved={()=>refetch()} />
    </div>
  );
}