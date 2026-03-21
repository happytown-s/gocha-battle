export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const TEAM_SIZE = 10;
export const HERO_REQUIRED = 1;
export const MOB_REQUIRED = 9;

export const SINGLE_GACHA_COST = 50;
export const TEN_GACHA_COST = 500;

export const WIN_REWARD_STONES = 120;
export const LOSE_REWARD_STONES = 40;

export const MAX_CPU_TEAMS = 3;

export const STORAGE_KEY = 'gocha_battle_save_v1';

export type UnitRole = 'hero' | 'mob';
export type Rarity = 'SSR' | 'SR' | 'R';

export interface CharacterMaster {
  id: string;
  name: string;
  role: UnitRole;
  rarity: Rarity;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  range: number;
}

export interface OwnedCharacter {
  uid: string;
  characterId: string;
}

export interface SaveData {
  stones: number;
  owned: OwnedCharacter[];
  formation: string[];
}
