"use client";
export function mark(id:string){ try{ performance.mark(id); }catch{} }
export function measure(name:string, start:string, end?:string){
  try{ performance.measure(name, start, end); }catch{}
}
