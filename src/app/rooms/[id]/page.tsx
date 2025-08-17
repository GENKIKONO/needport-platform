export const dynamic='force-dynamic'; 
export const revalidate=0;

import RoomClient from './room-client';

export default function Page({ params }:{params:{id:string}}){
  return (
    <main className="section">
      <h1 className="text-xl font-semibold mb-3">案件ルーム</h1>
      <RoomClient roomId={params.id}/>
    </main>
  );
}
