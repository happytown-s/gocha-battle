import Phaser from 'phaser';
import { HERO_REQUIRED, MOB_REQUIRED, TEAM_SIZE } from '../config';
import { CHARACTER_MAP } from '../data/characters';
import { SaveSystem } from '../systems/SaveSystem';
import { Button } from '../ui/Button';

export class FormationScene extends Phaser.Scene {
  constructor() {
    super('FormationScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d47a1, 0.65);

    const save = SaveSystem.load();
    const selected = new Set(save.formation);

    const title = this.add.text(width / 2, 24, '編成画面（ヒーロー1 + モブ9）', { fontFamily: '"M PLUS Rounded 1c", sans-serif', fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    const info = this.add.text(width / 2, 52, '', { fontFamily: '"M PLUS Rounded 1c", sans-serif', fontSize: '16px', color: '#ffecb3' }).setOrigin(0.5);

    const rows = save.owned.slice(0, 40);
    const buttons: Phaser.GameObjects.Rectangle[] = [];

    const refreshInfo = () => {
      const selectedOwned = save.owned.filter((o) => selected.has(o.uid));
      const heroCount = selectedOwned.filter((o) => CHARACTER_MAP.get(o.characterId)?.role === 'hero').length;
      const mobCount = selectedOwned.filter((o) => CHARACTER_MAP.get(o.characterId)?.role === 'mob').length;
      info.setText(`選択中: ${selectedOwned.length}/${TEAM_SIZE}  ヒーロー: ${heroCount}/${HERO_REQUIRED}  モブ: ${mobCount}/${MOB_REQUIRED}`);
    };

    rows.forEach((owned, idx) => {
      const c = CHARACTER_MAP.get(owned.characterId);
      if (!c) return;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = width * (0.25 + col * 0.5);
      const y = 90 + row * 34;

      const bg = this.add.rectangle(x, y, width * 0.44, 28, selected.has(owned.uid) ? 0x43a047 : 0x263238, 0.95)
        .setStrokeStyle(1, 0xffffff, 0.4)
        .setInteractive({ useHandCursor: true });
      this.add.text(x - width * 0.2, y, `${c.role === 'hero' ? '★' : '・'}[${c.rarity}] ${c.name}`, { fontFamily: '"M PLUS Rounded 1c", sans-serif', fontSize: '14px', color: '#fff' }).setOrigin(0, 0.5);

      bg.on('pointerdown', () => {
        if (selected.has(owned.uid)) selected.delete(owned.uid);
        else if (selected.size < TEAM_SIZE) selected.add(owned.uid);
        bg.setFillStyle(selected.has(owned.uid) ? 0x43a047 : 0x263238, 0.95);
        refreshInfo();
      });
      buttons.push(bg);
    });

    refreshInfo();

    new Button(this, width / 2, height - 76, 220, 48, 'この編成を保存', () => {
      const list = save.owned.filter((o) => selected.has(o.uid));
      const heroCount = list.filter((o) => CHARACTER_MAP.get(o.characterId)?.role === 'hero').length;
      const mobCount = list.filter((o) => CHARACTER_MAP.get(o.characterId)?.role === 'mob').length;
      if (list.length !== TEAM_SIZE || heroCount !== HERO_REQUIRED || mobCount !== MOB_REQUIRED) {
        title.setText('条件不一致: ヒーロー1 + モブ9 でちょうど10体必要です');
        return;
      }
      save.formation = list.map((o) => o.uid);
      SaveSystem.save(save);
      title.setText('編成を保存しました');
    }, 0x2e7d32);

    new Button(this, width / 2, height - 24, 220, 42, 'ホームへ戻る', () => this.scene.start('HomeScene'), 0x455a64);
  }
}
