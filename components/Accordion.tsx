'use client';
import { useState } from 'react';

export default function Accordion({
  title, children, defaultOpen=false, className=''
}:{title:string; children:React.ReactNode; defaultOpen?:boolean; className?:string}){
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`accordion ${open?'open':''} ${className}`}>
      <div className="acc-head" onClick={()=>setOpen(!open)}>
        <span className="acc-title">{title}</span>
        <span>{open ? '▾' : '▸'}</span>
      </div>
      <div className="acc-body">{children}</div>
    </div>
  );
}
