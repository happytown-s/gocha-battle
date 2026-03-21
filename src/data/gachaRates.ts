import type { Rarity } from '../config';

export interface GachaRate {
  rarity: Rarity;
  weight: number;
}

export const GACHA_RATES: GachaRate[] = [
  { rarity: 'SSR', weight: 5 },
  { rarity: 'SR', weight: 25 },
  { rarity: 'R', weight: 70 },
];
