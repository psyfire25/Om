import { NextResponse } from 'next/server';
export function json(data:any, init:number|ResponseInit=200){const i=typeof init==='number'?{status:init}:init; return NextResponse.json(data,i)}
export function bad(msg='Bad Request'){return new NextResponse(msg,{status:400})}
