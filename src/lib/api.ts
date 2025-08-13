import { NextResponse } from 'next/server';

export function jsonOk(data: any, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function jsonError(message: string, status: number = 400, extras?: Record<string, any>) {
  return NextResponse.json(
    { 
      ok: false, 
      message,
      ...extras 
    }, 
    { status }
  );
}
