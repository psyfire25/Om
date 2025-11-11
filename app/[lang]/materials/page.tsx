'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import MaterialModal from '@/components/modals/MaterialModal';
import { Material, Project } from '@/lib/schema';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function MaterialsPage({ params }:{ params:{ lang: Locale }}) {
  const lang = params.lang;
  const { data: materials = [], mutate: refetchMaterials } = useSWR<Material[]>('/api/materials', fetcher);
  const { data: projects = [], mutate: refetchProjects } = useSWR<Project[]>('/api/projects', fetcher);
  const [selectedMaterial, setSelectedMaterial] = useState<Material|null>(null);
  const [materialModal, setMaterialModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string }>({ open: false, mode: 'create' });

  const materialProject = selectedMaterial ? projects.find((p:Project) => p.id === selectedMaterial.projectId) : null;

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="main-content">
        <div className="columns" style={{ padding: 20 }}>
          <div className="column">
            <div className="col-label">{t(lang,'materialsInventory')}</div>
            <div className="card">
              <ul>
                {materials.map((m:Material)=>(
                  <li key={m.id} className={`clickable ${selectedMaterial?.id === m.id ? 'active' : ''}`} onClick={()=>setSelectedMaterial(m)}>
                    {m.name}
                  </li>
                ))}
              </ul>
              <button onClick={() => setMaterialModal({ open: true, mode: 'create' })}>Add Material</button>
            </div>
          </div>
          {selectedMaterial && (
            <div className="column">
              <div className="col-label">Material Details</div>
              <div className="card">
                <h2>{selectedMaterial.name}</h2>
                <p>Quantity: {selectedMaterial.quantity} {selectedMaterial.unit}</p>
                <p>SKU: {selectedMaterial.sku || '–'}</p>
                <p>Location: {selectedMaterial.location || '–'}</p>
                <p>Notes: {selectedMaterial.notes || '–'}</p>
                <p>Project: {materialProject?.name || '–'}</p>
                <button onClick={() => setMaterialModal({ open: true, mode: 'edit', id: selectedMaterial.id })}>Edit Material</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <MaterialModal
        open={materialModal.open}
        mode={materialModal.mode}
        id={materialModal.id}
        projects={projects}
        onClose={()=>setMaterialModal({ open: false, mode: 'create' })}
        onSaved={()=>{refetchMaterials(); if(selectedMaterial) setSelectedMaterial(materials.find(m => m.id === selectedMaterial.id) || null)}}
        onCreated={()=>refetchMaterials()}
      />
    </div>
  );
}