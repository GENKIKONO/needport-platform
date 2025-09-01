export function logError(where:string, e:any, meta?:any){
  console.error(`[ERR] ${where}:`, e?.message || e, meta || "");
}
export function logInfo(where:string, meta?:any){
  console.log(`[INFO] ${where}`, meta || "");
}
