import Phaser from 'phaser';
import type { CharacterMaster } from '../config';
import { Unit, type TeamKind } from './Unit';

export class MobUnit extends Unit {
  constructor(scene: Phaser.Scene, x: number, y: number, stats: CharacterMaster, team: TeamKind) {
    super(scene, x, y, stats, team);
  }
}
