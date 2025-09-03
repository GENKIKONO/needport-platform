export const DB_TIMEOUT_MS = Number(process.env.DB_TIMEOUT_MS||"8000");
export function withTimeout<T>(p:Promise<T>, ms=DB_TIMEOUT_MS){
  return new Promise<T>((resolve,reject)=>{
    const t=setTimeout(()=>reject(new Error("DB_TIMEOUT")), ms);
    p.then(x=>{clearTimeout(t); resolve(x);}).catch(e=>{clearTimeout(t); reject(e);});
  });
}
