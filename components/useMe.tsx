'use client';
import useSWR from 'swr';
const fetcher = (u:string)=>fetch(u).then(r=>r.ok?r.json():null);

export type Me = { id:string; name:string; email:string; role:'STAFF'|'ADMIN'|'SUPER'; active:boolean } | null;

export default function useMe() {
  const { data, isLoading, mutate } = useSWR<Me>('/api/users/me', fetcher);
  return { me: data, loading: isLoading, refresh: mutate };
}