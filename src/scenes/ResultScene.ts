import Phaser from 'phaser';
import { LOSE_REWARD_STONES, WIN_REWARD_STONES } from '../config';
import { SaveSystem } from '../systems/SaveSystem';
import { Button } from '../ui/Button';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(data: { result: 'win' | 'lose' }): void {
    const { width, height } = this.scale;
    const win = data.result === 'win';
    const reward = win ? WIN_REWARD_STONES : LOSE_REWARD_STONES;

    const save = SaveSystem.load();
    save.stones += reward;
    SaveSystem.save(save);

    this.add.rectangle(width / 2, height / 2, width, height, win ? 0x1b5e20 : 0x303030, 0.92);

    if (!win) {
      this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.25);
    }

    if (win) {
      const particles = this.add.particles(width / 2, 40, 'particle', {
        lifespan: 1400,
        speedY: { min: 70, max: 180 },
        speedX: { min: -80, max: 80 },
        scale: { start: 0.35, end: 0 },
        tint: [0xffd54f, 0xfff59d, 0xffca28],
        quantity: 4,
        blendMode: 'ADD',
      });
      this.time.delayedCall(1800, () => particles.stop());
    }

    const title = this.add.text(width / 2, 140, win ? '勝利！' : '敗北…', {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: '56px',
      color: win ? '#fff8e1' : '#e0e0e0',
      fontStyle: 'bold',
      stroke: win ? '#8d6e63' : '#424242',
      strokeThickness: 6,
    }).setOrigin(0.5);

    if (win) {
      title.setScale(0.7);
      this.tweens.add({
        targets: title,
        scale: 1.08,
        duration: 420,
        ease: 'Back.Out',
      });
    }

    this.add.text(width / 2, 230, `報酬ガチャ石: +${reward}`, {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: '28px',
      color: '#fffde7',
    }).setOrigin(0.5);
    this.add.text(width / 2, 278, `現在のガチャ石: ${save.stones}`, {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: '24px',
      color: '#fff',
    }).setOrigin(0.5);

    new Button(this, width / 2, height - 90, 240, 52, 'もう一度バトル', () => this.scene.start('BattleScene'), 0x1e88e5);
    new Button(this, width / 2, height - 28, 240, 42, 'ホームへ戻る', () => this.scene.start('HomeScene'), 0xef6c00);
  }
}
