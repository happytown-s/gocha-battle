import type { CharacterMaster } from '../config';

export const CHARACTERS: CharacterMaster[] = [
  { id: 'hero_azure', name: '蒼刃のヒーロー', role: 'hero', rarity: 'SSR', hp: 460, atk: 38, def: 14, spd: 78, range: 120 },
  { id: 'hero_guard', name: '鉄壁のヒーロー', role: 'hero', rarity: 'SR', hp: 520, atk: 30, def: 18, spd: 70, range: 110 },
  { id: 'hero_sniper', name: '流星のヒーロー', role: 'hero', rarity: 'SSR', hp: 390, atk: 44, def: 10, spd: 76, range: 170 },

  { id: 'mob_soldier', name: 'ソルジャー', role: 'mob', rarity: 'R', hp: 180, atk: 16, def: 8, spd: 106, range: 90 },
  { id: 'mob_scout', name: 'スカウト', role: 'mob', rarity: 'R', hp: 150, atk: 14, def: 6, spd: 122, range: 95 },
  { id: 'mob_gunner', name: 'ガンナー', role: 'mob', rarity: 'SR', hp: 160, atk: 18, def: 7, spd: 98, range: 140 },
  { id: 'mob_lancer', name: 'ランサー', role: 'mob', rarity: 'SR', hp: 170, atk: 20, def: 8, spd: 104, range: 100 },
  { id: 'mob_medic', name: 'メディック', role: 'mob', rarity: 'R', hp: 160, atk: 12, def: 9, spd: 110, range: 100 },
  { id: 'mob_brute', name: 'ブルート', role: 'mob', rarity: 'SR', hp: 230, atk: 19, def: 12, spd: 88, range: 85 },
];

export const CHARACTER_MAP = new Map(CHARACTERS.map((c) => [c.id, c]));
