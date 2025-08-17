import mockData from './data.json';

export const mockNeeds = mockData.needs;
export const mockOffers = mockData.offers;

export function findMockNeed(id: string) {
  return mockNeeds.find(need => need.id === id) || null;
}

export function findMockOffers(needId: string) {
  return mockOffers.filter(offer => offer.needId === needId);
}
