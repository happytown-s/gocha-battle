import Phaser from 'phaser';

export class HPBar {
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly fg: Phaser.GameObjects.Graphics;
  private width: number;
  private height: number;

  constructor(private scene: Phaser.Scene, private x: number, private y: number, width = 28, height = 6) {
    this.width = width;
    this.height = height;
    this.bg = scene.add.graphics();
    this.fg = scene.add.graphics();
    this.redraw(1);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.redraw(this.lastRatio);
  }

  private lastRatio = 1;

  private getGradientColor(ratio: number): number {
    const r = Phaser.Math.Clamp(ratio, 0, 1);
    if (r > 0.5) {
      const t = (r - 0.5) / 0.5;
      return Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0xffc107),
        Phaser.Display.Color.ValueToColor(0x4caf50),
        100,
        Math.floor(t * 100),
      ).color;
    }
    const t = r / 0.5;
    return Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xf44336),
      Phaser.Display.Color.ValueToColor(0xffc107),
      100,
      Math.floor(t * 100),
    ).color;
  }

  redraw(ratio: number): void {
    this.lastRatio = Phaser.Math.Clamp(ratio, 0, 1);
    this.bg.clear();
    this.fg.clear();

    const x = this.x - this.width / 2;
    const y = this.y - this.height / 2;
    const radius = this.height / 2;

    this.bg.fillStyle(0x000000, 0.7);
    this.bg.fillRoundedRect(x, y, this.width, this.height, radius);

    const innerW = (this.width - 2) * this.lastRatio;
    if (innerW > 0) {
      const color = this.getGradientColor(this.lastRatio);
      this.fg.fillStyle(color, 1);
      this.fg.fillRoundedRect(x + 1, y + 1, innerW, this.height - 2, Math.max(1, radius - 1));
    }
  }

  destroy(): void {
    this.bg.destroy();
    this.fg.destroy();
  }
}
