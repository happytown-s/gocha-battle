import { STORAGE_KEY, type OwnedCharacter, type SaveData } from '../config';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

const starterOwned: OwnedCharacter[] = [
  { uid: generateId(), characterId: 'hero_guard' },
  ...Array.from({ length: 12 }, () => ({ uid: generateId(), characterId: 'mob_soldier' })),
  ...Array.from({ length: 6 }, () => ({ uid: generateId(), characterId: 'mob_scout' })),
];

const starterFormation = () => {
  const hero = starterOwned.find((o) => o.characterId.startsWith('hero_'));
  const mobs = starterOwned.filter((o) => o.characterId.startsWith('mob_')).slice(0, 9);
  return hero ? [hero.uid, ...mobs.map((m) => m.uid)] : mobs.map((m) => m.uid);
};

export class SaveSystem {
  static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const init: SaveData = { stones: 1200, owned: starterOwned, formation: starterFormation() };
        this.save(init);
        return init;
      }
      const parsed = JSON.parse(raw) as SaveData;
      if (!parsed.owned || !Array.isArray(parsed.owned)) throw new Error('invalid save');
      return parsed;
    } catch {
      const init: SaveData = { stones: 1200, owned: starterOwned, formation: starterFormation() };
      this.save(init);
      return init;
    }
  }

  static save(data: SaveData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static reset(): SaveData {
    const init: SaveData = { stones: 1200, owned: starterOwned, formation: starterFormation() };
    this.save(init);
    return init;
  }
}
