# ゴチャキャラバトル（Gocha Character Battle）

Phaser 3 + TypeScript + Vite で作成した、2Dトップダウンのストラテジー×オートバトルWebゲームのプロトタイプです。

## セットアップ

```bash
cd gocha-battle
npm install
```

## 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてプレイできます。

## ビルド

```bash
npm run build
npm run preview
```

## 遊び方

1. **ホーム**
   - 「ガチャ」「編成」「バトル開始」を選択
2. **ガチャ**
   - 単発 / 10連でキャラを入手（ガチャ石を消費）
3. **編成**
   - 所持キャラから **ヒーロー1 + モブ9 = 10体** を選び保存
4. **バトル**
   - 青（自チーム） vs 赤（CPU）
   - 画面クリックで自チーム全体の移動先を指定
   - 射程内の敵を自動攻撃（HPバー表示）
5. **結果**
   - 勝敗に応じてガチャ石を獲得

## 保存仕様

- `LocalStorage` に以下を保存：
  - 所持ガチャ石
  - 所持キャラ
  - 編成
- ホーム画面の「データ初期化」で初期状態に戻せます。

## 構成

- `src/scenes` : 各画面
- `src/entities` : ユニット（ヒーロー/モブ）
- `src/systems` : 戦闘、ガチャ、保存
- `src/data` : キャラDB、ガチャ確率
- `src/ui` : ボタン、HPバー
