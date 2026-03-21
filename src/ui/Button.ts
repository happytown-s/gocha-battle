import Phaser from 'phaser';

export class Button {
  readonly container: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    color = 0x1e88e5,
  ) {
    const shadow = scene.add.rectangle(2, 4, width, height, 0x0b1b2b, 0.45)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0x000000, 0.2);
    const bg = scene.add.rectangle(0, 0, width, height, color, 0.98)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff, 0.7);

    bg.setDisplaySize(width, height);
    bg.setData('baseColor', color);

    const text = scene.add.text(0, 0, label, {
      fontFamily: '"M PLUS Rounded 1c", sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: '700',
      stroke: '#0b1b2b',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y, [shadow, bg, text]);

    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        scene.tweens.killTweensOf(this.container);
        scene.tweens.add({
          targets: this.container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 120,
          ease: 'Quad.Out',
        });
      })
      .on('pointerout', () => {
        scene.tweens.killTweensOf(this.container);
        scene.tweens.add({
          targets: this.container,
          scaleX: 1,
          scaleY: 1,
          duration: 120,
          ease: 'Quad.Out',
        });
      })
      .on('pointerdown', () => {
        scene.tweens.killTweensOf(this.container);
        scene.tweens.add({
          targets: this.container,
          scaleX: 0.97,
          scaleY: 0.97,
          duration: 70,
          yoyo: true,
          ease: 'Quad.Out',
        });
        onClick();
      });
  }

  setLabel(label: string): void {
    const text = this.container.list[2] as Phaser.GameObjects.Text;
    text.setText(label);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
