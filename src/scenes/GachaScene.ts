import Phaser from 'phaser';
import { SINGLE_GACHA_COST, TEN_GACHA_COST } from '../config';
import { SaveSystem } from '../systems/SaveSystem';
import { GachaSystem } from '../systems/GachaSystem';
import { Button } from '../ui/Button';
import { CHARACTERS } from '../data/characters';

export class GachaScene extends Phaser.Scene {
  constructor() {
    super('GachaScene');
  }

  preload(): void {
    this.load.image('gacha_icon_hero', 'sprites/pixel/clean_blue_hero.png');
    this.load.image('gacha_icon_boss', 'sprites/pixel/clean_pxl_red_boss.png');
    this.load.image('gacha_icon_soldier', 'sprites/pixel/clean_pxl_blue_mob.png');
    this.load.image('gacha_icon_goblin', 'sprites/pixel/clean_pxl_red_mob.png');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x102a43, 0.9);

    let save = SaveSystem.load();
    const stoneText = this.add.text(width / 2, 36, `ガチャ石: ${save.stones}`, {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: '24px',
      color: '#fff',
      fontStyle: '700',
    }).setOrigin(0.5);

    const resultContainer = this.add.container(width / 2, 198);
    const placeholder = this.add.text(0, 0, 'ここにガチャ結果が表示されます', {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: '20px',
      color: '#fffde7',
      align: 'center',
      wordWrap: { width: width - 80 },
    }).setOrigin(0.5, 0);
    resultContainer.add(placeholder);

    const isHeroName = new Set(CHARACTERS.filter((c) => c.role === 'hero').map((c) => c.name));

    const getIconKey = (name: string, rarity: 'SSR' | 'SR' | 'R'): string => {
      if (isHeroName.has(name)) {
        return rarity === 'SSR' ? 'gacha_icon_hero' : 'gacha_icon_boss';
      }
      return rarity === 'SR' ? 'gacha_icon_goblin' : 'gacha_icon_soldier';
    };

    const showCard = (
      label: string,
      rarity: 'SSR' | 'SR' | 'R',
      x: number,
      y: number,
      cardWidth: number,
      centerText = false,
      iconName?: string,
    ) => {
      const cardColor = rarity === 'SSR' ? 0xffd54f : rarity === 'SR' ? 0x7e57c2 : 0x42a5f5;
      const titleColor = rarity === 'SSR' ? '#4e342e' : '#ffffff';
      const card = this.add.rectangle(x, y, cardWidth, 56, cardColor, 0.95)
        .setStrokeStyle(2, 0xffffff, 0.7)
        .setOrigin(0.5, 0);

      if (iconName) {
        const icon = this.add.image(x - cardWidth / 2 + 30, y + 28, getIconKey(iconName, rarity))
          .setDisplaySize(32, 32)
          .setOrigin(0.5);
        resultContainer.add(icon);
      }

      const text = this.add.text(centerText ? x : x - cardWidth / 2 + 54, y + 28, `[${rarity}] ${label}`, {
        fontFamily: '"M PLUS Rounded 1c", sans-serif',
        fontSize: '20px',
        color: titleColor,
        fontStyle: '700',
      }).setOrigin(centerText ? 0.5 : 0, 0.5);

      resultContainer.add([card, text]);
    };

    const clearResults = () => {
      resultContainer.removeAll(true);
    };

    const rarityRank = (rarity: string): 0 | 1 | 2 => {
      if (rarity === 'SSR') return 2;
      if (rarity === 'SR') return 1;
      return 0;
    };

    const showResults = (count: 1 | 10, results: Array<{ rarity: string; name: string }>) => {
      clearResults();

      const topRank = Math.max(...results.map((r) => rarityRank(r.rarity)));
      if (topRank >= 0) {
        const flashColor = topRank === 2 ? 0xffd54f : topRank === 1 ? 0x9c27b0 : 0x42a5f5;
        const flash = this.add.rectangle(width / 2, height / 2, width, height, flashColor, 0)
          .setDepth(999);
        this.tweens.add({
          targets: flash,
          alpha: 0.35,
          duration: 120,
          yoyo: true,
          ease: 'Sine.Out',
          onComplete: () => flash.destroy(),
        });
      }

      if (count === 1) {
        const r = results[0];
        const singleCardWidth = Math.min(width - 180, 460);
        showCard(r.name, (r.rarity as 'SSR' | 'SR' | 'R') ?? 'R', 0, 0, singleCardWidth, true, r.name);
      } else {
        const title = this.add.text(0, -8, '-10連ガチャ結果-', {
          fontFamily: '"M PLUS Rounded 1c", sans-serif',
          fontSize: '22px',
          color: '#ffffff',
          fontStyle: '700',
        }).setOrigin(0.5, 0);
        resultContainer.add(title);

        const cardWidth = Math.min((width - 180) / 2, 340);
        const colGap = 28;
        const leftX = -(cardWidth / 2 + colGap / 2);
        const rightX = cardWidth / 2 + colGap / 2;

        results.forEach((r, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = col === 0 ? leftX : rightX;
          const y = 34 + row * 62;
          showCard(`${i + 1}. ${r.name}`, (r.rarity as 'SSR' | 'SR' | 'R') ?? 'R', x, y, cardWidth, false, r.name);
        });
      }
    };

    const run = (count: 1 | 10) => {
      clearResults();
      const loadingText = this.add.text(0, 0, 'ガチャ中...', {
        fontFamily: '"M PLUS Rounded 1c", sans-serif',
        fontSize: '28px',
        color: '#fffde7',
        fontStyle: '700',
      }).setOrigin(0.5, 0);
      resultContainer.add(loadingText);

      this.tweens.add({
        targets: loadingText,
        alpha: 0.35,
        duration: 260,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.InOut',
      });

      this.time.delayedCall(1000, () => {
        const { updated, results, cost } = GachaSystem.pull(save, count);
        if (cost === 0) {
          clearResults();
          const failText = this.add.text(0, 0, 'ガチャ石が足りません。', {
            fontFamily: '"M PLUS Rounded 1c", sans-serif',
            fontSize: '22px',
            color: '#ffccbc',
            fontStyle: '700',
          }).setOrigin(0.5, 0);
          resultContainer.add(failText);
          return;
        }

        save = updated;
        SaveSystem.save(save);
        stoneText.setText(`ガチャ石: ${save.stones}`);
        showResults(count, results.map((r) => ({ rarity: r.rarity, name: r.name })));
      });
    };

    new Button(this, width / 2 - 140, 96, 220, 52, `単発 (${SINGLE_GACHA_COST})`, () => run(1), 0x1e88e5);
    new Button(this, width / 2 + 140, 96, 220, 52, `10連 (${TEN_GACHA_COST})`, () => run(10), 0x8e24aa);
    new Button(this, width / 2, height - 44, 200, 48, 'ホームへ戻る', () => this.scene.start('HomeScene'), 0xef6c00);
  }
}
