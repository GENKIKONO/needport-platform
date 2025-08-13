import data from './data.json';
import type { Need, Offer, SummaryVersion, Room, Membership } from './types';

export async function listNeeds(): Promise<Need[]> {
  // ダミーの遅延を追加
  await new Promise(resolve => setTimeout(resolve, 500));
  return data.needs as Need[];
}

export async function getNeed(id: string): Promise<Need | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return (data.needs as Need[]).find(need => need.id === id) || null;
}

export async function getOffersByNeed(needId: string): Promise<Offer[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return (data.offers as Offer[]).filter(offer => offer.needId === needId);
}

export async function getAdoptedOffer(needId: string): Promise<Offer | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const need = (data.needs as Need[]).find(n => n.id === needId);
  if (!need || !need.adopted_offer_id) return null;
  
  return (data.offers as Offer[]).find(offer => offer.id === need.adopted_offer_id) || null;
}

export async function getSummaries(needId: string): Promise<SummaryVersion[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return (data.summaries as SummaryVersion[]).filter(summary => summary.needId === needId);
}

export async function getLatestSummary(needId: string): Promise<SummaryVersion | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const summaries = (data.summaries as SummaryVersion[]).filter(summary => summary.needId === needId);
  if (summaries.length === 0) return null;
  
  return summaries.sort((a, b) => b.version - a.version)[0];
}

export async function getRoomByNeed(needId: string): Promise<Room | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return (data.rooms as Room[]).find(room => room.needId === needId) || null;
}

export async function getRoom(id: string): Promise<Room | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return (data.rooms as Room[]).find(room => room.id === id) || null;
}

export async function getMembership(): Promise<Membership> {
  // 初期はダミー。isGuest=true にしておけばゲート表示が確認できる
  return { isGuest: true, isUserMember: false, isProMember: false };
}

// 運営用API
export async function getOffersForComparison(needId: string): Promise<Offer[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return (data.offers as Offer[]).filter(offer => offer.needId === needId);
}

export async function getOfferResponseTime(offerId: string): Promise<string | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const offer = (data.offers as Offer[]).find(o => o.id === offerId);
  return offer?.responseTime || null;
}
