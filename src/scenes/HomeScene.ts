import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Button } from '../ui/Button';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveSystem.load();

    this.add.rectangle(width / 2, height / 2, width, height, 0x2e7d32, 0.7);
    this.add.text(width / 2, 56, 'ゴチャキャラバトル', { fontFamily: '"M PLUS Rounded 1c", sans-serif', fontSize: '40px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, 98, `所持ガチャ石: ${save.stones}`, { fontFamily: '"M PLUS Rounded 1c", sans-serif', fontSize: '22px', color: '#fffde7' }).setOrigin(0.5);

    new Button(this, width / 2, 190, 240, 56, 'ガチャ', () => this.scene.start('GachaScene'));
    new Button(this, width / 2, 270, 240, 56, '編成', () => this.scene.start('FormationScene'));
    new Button(this, width / 2, 350, 240, 56, 'バトル開始', () => this.scene.start('BattleScene'));
    new Button(this, width / 2, 430, 240, 48, 'データ初期化', () => {
      SaveSystem.reset();
      this.scene.restart();
    }, 0x6d4c41);

    this.add.text(width / 2, height - 20, 'ヒーロー1体 + モブ9体で出撃', { fontFamily: '"M PLUS Rounded 1c", sans-serif', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
  }
}
