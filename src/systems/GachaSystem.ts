import { TEN_GACHA_COST, SINGLE_GACHA_COST, type CharacterMaster, type SaveData } from '../config';
import { CHARACTERS } from '../data/characters';
import { GACHA_RATES } from '../data/gachaRates';

const rarityPool = new Map<string, CharacterMaster[]>([
  ['SSR', CHARACTERS.filter((c) => c.rarity === 'SSR')],
  ['SR', CHARACTERS.filter((c) => c.rarity === 'SR')],
  ['R', CHARACTERS.filter((c) => c.rarity === 'R')],
]);

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

function rollRarity(): 'SSR' | 'SR' | 'R' {
  const total = GACHA_RATES.reduce((acc, r) => acc + r.weight, 0);
  let v = Math.random() * total;
  for (const rate of GACHA_RATES) {
    v -= rate.weight;
    if (v <= 0) return rate.rarity;
  }
  return 'R';
}

function rollCharacter(): CharacterMaster {
  const rarity = rollRarity();
  const pool = rarityPool.get(rarity) ?? CHARACTERS;
  return pool[Math.floor(Math.random() * pool.length)] ?? CHARACTERS[0];
}

export class GachaSystem {
  static canPull(save: SaveData, count: 1 | 10): boolean {
    const cost = count === 1 ? SINGLE_GACHA_COST : TEN_GACHA_COST;
    return save.stones >= cost;
  }

  static pull(save: SaveData, count: 1 | 10): { updated: SaveData; results: CharacterMaster[]; cost: number } {
    const cost = count === 1 ? SINGLE_GACHA_COST : TEN_GACHA_COST;
    if (save.stones < cost) {
      return { updated: save, results: [], cost: 0 };
    }

    const results: CharacterMaster[] = [];
    const next: SaveData = {
      ...save,
      stones: save.stones - cost,
      owned: [...save.owned],
      formation: [...save.formation],
    };

    for (let i = 0; i < count; i += 1) {
      const c = rollCharacter();
      results.push(c);
      next.owned.push({ uid: generateId(), characterId: c.id });
    }

    return { updated: next, results, cost };
  }
}
