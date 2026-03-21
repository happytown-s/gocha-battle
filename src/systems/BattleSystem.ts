import Phaser from 'phaser';
import { Unit } from '../entities/Unit';

export type BattleResult = 'win' | 'lose' | 'ongoing';

export class BattleSystem {
  constructor(private readonly allUnits: Unit[]) {}

  update(dt: number): BattleResult {
    for (const u of this.allUnits) {
      u.update(dt);
    }

    for (const attacker of this.allUnits) {
      if (!attacker.alive || attacker.attackCooldown > 0) continue;
      const enemies = this.allUnits.filter((u) => u.alive && u.team !== attacker.team);
      if (enemies.length === 0) continue;

      enemies.sort((a, b) => attacker.distanceTo(a) - attacker.distanceTo(b));
      const target = enemies[0];
      if (!target) continue;

      const dist = attacker.distanceTo(target);
      if (dist <= attacker.stats.range) {
        target.takeDamage(attacker.stats.atk);
        attacker.attackCooldown = 700;
      }
    }

    const playerAlive = this.allUnits.some((u) => u.alive && u.team === 'player');
    const cpuAlive = this.allUnits.some((u) => u.alive && u.team === 'cpu');

    if (playerAlive && cpuAlive) return 'ongoing';
    return playerAlive ? 'win' : 'lose';
  }

  moveTeam(units: Unit[], x: number, y: number): void {
    const alive = units.filter((u) => u.alive);
    if (alive.length === 0) return;

    const cols = Math.ceil(Math.sqrt(alive.length));
    const gap = 22;
    alive.forEach((u, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = x + (col - cols / 2) * gap;
      const ty = y + (row - cols / 2) * gap;
      u.moveTo(Phaser.Math.Clamp(tx, 30, 930), Phaser.Math.Clamp(ty, 30, 510));
    });
  }
}
