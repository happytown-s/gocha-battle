import Phaser from 'phaser';
import { TEAM_SIZE, type CharacterMaster } from '../config';
import { CHARACTER_MAP, CHARACTERS } from '../data/characters';
import { HeroUnit } from '../entities/HeroUnit';
import { MobUnit } from '../entities/MobUnit';
import { Unit } from '../entities/Unit';
import { BattleSystem } from '../systems/BattleSystem';
import { SaveSystem } from '../systems/SaveSystem';

export class BattleScene extends Phaser.Scene {
  private playerUnits: Unit[] = [];
  private cpuUnits: Unit[] = [];
  private battleSystem?: BattleSystem;
  private resultSent = false;
  private hpSnapshot = new Map<Unit, number>();
  private onPointerDown?: (pointer: Phaser.Input.Pointer) => void;

  constructor() {
    super('BattleScene');
  }

  preload(): void {
    this.load.spritesheet('blue_hero_sheet', 'sprites/blue_hero_sheet.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('red_boss_sheet', 'sprites/red_boss_sheet.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('blue_mob_sheet', 'sprites/blue_mob_sheet.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('red_mob_sheet', 'sprites/red_mob_sheet.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.image('blue_hero', 'sprites/pixel/clean_blue_hero.png');
    this.load.image('red_boss', 'sprites/pixel/clean_pxl_red_boss.png');
    this.load.image('blue_mob', 'sprites/pixel/clean_pxl_blue_mob.png');
    this.load.image('red_mob', 'sprites/pixel/clean_pxl_red_mob.png');
  }

  create(): void {
    this.resultSent = false;
    this.hpSnapshot.clear();

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x558b2f, 1);
    this.add.grid(width / 2, height / 2, width, height, 32, 32, 0x000000, 0, 0x000000, 0.15);
    this.add.text(10, 10, '青: 味方  赤: 敵  クリック: 移動', {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    });

    const save = SaveSystem.load();
    const formation = save.formation
      .map((uid) => save.owned.find((o) => o.uid === uid))
      .filter((v): v is NonNullable<typeof v> => Boolean(v))
      .slice(0, TEAM_SIZE);

    const playerCharacters = formation
      .map((o) => CHARACTER_MAP.get(o.characterId))
      .filter((v): v is NonNullable<typeof v> => Boolean(v));

    if (playerCharacters.length < TEAM_SIZE) {
      this.add.text(width / 2, height / 2, '編成が不足しています。\n編成画面で10体選んでください。', {
        fontFamily: '"M PLUS Rounded 1c", sans-serif',
        fontSize: '26px',
        color: '#fff',
      }).setOrigin(0.5);
      this.input.once('pointerdown', () => this.scene.start('FormationScene'));
      return;
    }

    this.playerUnits = this.spawnTeam(playerCharacters, 'player', 120, height / 2);

    const nerf = (c: CharacterMaster): CharacterMaster => ({
      ...c,
      hp: Math.floor(c.hp * 0.9),
      atk: Math.floor(c.atk * 0.85),
      def: Math.floor(c.def * 0.8),
    });

    const cpuHeroes = CHARACTERS.filter((c) => c.role === 'hero').map(nerf);
    const cpuMobs = CHARACTERS.filter((c) => c.role === 'mob').map(nerf);
    const cpuChars = [
      cpuHeroes[Math.floor(Math.random() * cpuHeroes.length)],
      ...Array.from({ length: 9 }, () => cpuMobs[Math.floor(Math.random() * cpuMobs.length)]),
    ];
    this.cpuUnits = this.spawnTeam(cpuChars, 'cpu', width - 120, height / 2);

    this.battleSystem = new BattleSystem([...this.playerUnits, ...this.cpuUnits]);
    [...this.playerUnits, ...this.cpuUnits].forEach((u) => this.hpSnapshot.set(u, u.hp));

    this.onPointerDown = (pointer: Phaser.Input.Pointer) => {
      this.battleSystem?.moveTeam(this.playerUnits, pointer.x, pointer.y);
    };
    this.input.on('pointerdown', this.onPointerDown);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.onPointerDown) {
        this.input.off('pointerdown', this.onPointerDown);
      }
      this.onPointerDown = undefined;
      this.battleSystem = undefined;
      this.playerUnits = [];
      this.cpuUnits = [];
      this.hpSnapshot.clear();
    });

    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        const living = this.cpuUnits.filter((u) => u.alive);
        if (!living.length || !this.battleSystem) return;
        const playerAlive = this.playerUnits.filter((u) => u.alive);
        if (playerAlive.length === 0) return;
        const target = playerAlive[Math.floor(Math.random() * playerAlive.length)];
        const tx = target.x + Phaser.Math.Between(-40, 40);
        const ty = target.y + Phaser.Math.Between(-40, 40);
        this.battleSystem.moveTeam(living, tx, ty);
      },
    });
  }

  update(_: number, dt: number): void {
    if (!this.battleSystem || this.resultSent) return;
    const result = this.battleSystem.update(dt);

    [...this.playerUnits, ...this.cpuUnits].forEach((unit) => {
      const prev = this.hpSnapshot.get(unit) ?? unit.hp;
      if (unit.hp < prev) {
        this.showDamagePopup(unit, prev - unit.hp);
      }
      this.hpSnapshot.set(unit, unit.hp);
    });

    if (result === 'ongoing') return;
    this.resultSent = true;
    this.scene.start('ResultScene', { result });
  }

  private showDamagePopup(unit: Unit, damage: number): void {
    const isBig = damage >= 40;
    const text = this.add.text(unit.x, unit.y - 24, `${Math.floor(damage)}`, {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: isBig ? '28px' : '22px',
      fontStyle: '800',
      color: isBig ? '#ffd54f' : '#ff5252',
      stroke: '#1a1a1a',
      strokeThickness: 4,
    }).setOrigin(0.5);

    text.setScale(0.6);
    this.tweens.add({
      targets: text,
      scale: 1,
      duration: 120,
      ease: 'Back.Out',
    });
    this.tweens.add({
      targets: text,
      y: text.y - 36,
      alpha: 0,
      duration: 520,
      ease: 'Cubic.Out',
      onComplete: () => text.destroy(),
    });
  }

  private spawnTeam(chars: Array<NonNullable<ReturnType<typeof CHARACTER_MAP.get>>>, team: 'player' | 'cpu', cx: number, cy: number): Unit[] {
    const units: Unit[] = [];
    const cols = 4;
    const gap = 28;
    chars.forEach((c, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = cx + (col - cols / 2) * gap;
      const y = cy + (row - 1.2) * gap;
      units.push(c.role === 'hero' ? new HeroUnit(this, x, y, c, team) : new MobUnit(this, x, y, c, team));
    });
    return units;
  }
}
