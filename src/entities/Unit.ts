import Phaser from 'phaser';
import type { CharacterMaster } from '../config';
import { HPBar } from '../ui/HPBar';

export type TeamKind = 'player' | 'cpu';

export class Unit {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly hpBar: HPBar;
  readonly team: TeamKind;
  readonly stats: CharacterMaster;
  readonly walkAnimKey: string;
  readonly idleAnimKey: string;
  readonly attackAnimKey: string;
  hp: number;
  alive = true;

  targetPos?: Phaser.Math.Vector2;
  attackCooldown = 0;

  readonly baseCooldown: number;

  constructor(scene: Phaser.Scene, x: number, y: number, stats: CharacterMaster, team: TeamKind) {
    this.team = team;
    this.stats = stats;
    this.hp = stats.hp;
    this.baseCooldown = stats.role === 'hero' ? 500 : 700;

    const isHero = stats.role === 'hero';
    const isPlayer = team === 'player';

    let spriteSheetKey: string;
    if (isHero && isPlayer) spriteSheetKey = 'blue_hero_sheet';
    else if (isHero && !isPlayer) spriteSheetKey = 'red_boss_sheet';
    else if (!isHero && isPlayer) spriteSheetKey = 'blue_mob_sheet';
    else spriteSheetKey = 'red_mob_sheet';

    if (isHero && isPlayer) {
      this.walkAnimKey = 'blue_hero_walk';
      this.idleAnimKey = 'blue_hero_idle';
      this.attackAnimKey = 'blue_hero_attack';
    } else if (isHero && !isPlayer) {
      this.walkAnimKey = 'red_boss_walk';
      this.idleAnimKey = 'red_boss_idle';
      this.attackAnimKey = 'red_boss_attack';
    } else if (!isHero && isPlayer) {
      this.walkAnimKey = 'blue_mob_walk';
      this.idleAnimKey = 'blue_mob_idle';
      this.attackAnimKey = 'blue_mob_attack';
    } else {
      this.walkAnimKey = 'red_mob_walk';
      this.idleAnimKey = 'red_mob_idle';
      this.attackAnimKey = 'red_mob_attack';
    }

    const targetSize = isHero ? 80 : 48;

    this.sprite = scene.add.sprite(x, y, spriteSheetKey, 0).setOrigin(0.5);
    this.sprite.play(this.walkAnimKey, true);

    const baseSize = Math.max(this.sprite.width, this.sprite.height) || 128;
    this.sprite.setScale(targetSize / baseSize);

    this.hpBar = new HPBar(scene, x, y + targetSize * 0.5 + 8, 30, 5);
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }

  distanceTo(unit: Unit): number {
    return Phaser.Math.Distance.Between(this.x, this.y, unit.x, unit.y);
  }

  moveTo(x: number, y: number): void {
    this.targetPos = new Phaser.Math.Vector2(x, y);
  }

  takeDamage(raw: number): void {
    const dmg = Math.max(1, raw - this.stats.def * 0.35);
    this.hp -= dmg;
    this.hpBar.redraw(this.hp / this.stats.hp);

    if (this.alive) {
      this.sprite.play(this.attackAnimKey, true);
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (!this.alive) return;
        const nextAnim = this.targetPos ? this.walkAnimKey : this.idleAnimKey;
        this.sprite.play(nextAnim, true);
      });
    }

    if (this.hp <= 0) this.die();
  }

  private die(): void {
    this.alive = false;
    this.sprite.setAlpha(0.25);
    this.hpBar.redraw(0);
  }

  update(dt: number): void {
    if (!this.alive) return;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    if (this.targetPos) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
      if (dist < 4) {
        this.targetPos = undefined;
        this.sprite.play(this.idleAnimKey, true);
      } else {
        this.sprite.play(this.walkAnimKey, true);
        const step = (this.stats.spd * dt) / 1000;
        const t = Math.min(1, step / dist);
        const nx = Phaser.Math.Interpolation.Linear([this.x, this.targetPos.x], t);
        const ny = Phaser.Math.Interpolation.Linear([this.y, this.targetPos.y], t);
        this.sprite.setPosition(nx, ny);
      }
    }
    const hpOffset = (this.stats.role === 'hero' ? 80 : 48) * 0.5 + 8;
    this.hpBar.setPosition(this.x, this.y + hpOffset);
  }

  destroy(): void {
    this.sprite.destroy();
    this.hpBar.destroy();
  }
}
