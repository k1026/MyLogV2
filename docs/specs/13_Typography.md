# 13_Typography

本アプリケーションにおけるフォント、文字サイズ、カラーの仕様定義。

## 1. フォントシステム
- **基本フォント**: `font-sans` (System default / Inter)
- **アイコン**: `Material Symbols Rounded` (24pxを基本とする)

## 2. 文字サイズ定義

### 2.1 ヘッダーUI
- **アプリタイトル**: 20px (`text-xl`), `font-black`, `tracking-tight`
- **バージョン番号**: 12px, `font-bold`, `tracking-widest`, `uppercase`
- **統計情報 (CARD/CELL)**: 9px, `font-bold`, `tracking-widest`, `uppercase`, 透過 (Slate 500/60)
- **統計情報の配置**: 位置情報アイコンの右側に縦並びで配置。

### 2.2 セルUI (Cell)
- **タイトル (name)**: 20px (基本), `font-bold`
    - `Time`セルのタイトルのみ: 14px, `font-medium`
- **内容 (value)**: 18px
- **プレースホルダー**: 各入力フィールドのサイズに準拠

### 2.3 カードUI (Card)
- **折りたたみ時タイトル**: 18px (`text-lg`), `font-bold`
- **列挙モード時サブ項目**: 14px (`text-sm`)
- **生成時刻表示**: 12px (`text-xs`)

### 2.4 フッターUI (Footer)
- **ボタンラベル**: 10px, `font-bold`, `uppercase`, `tracking-[0.1em]`

## 3. カラーパレット

### 3.1 テキストカラー
- **Primary (Slate 800)**: `#1e293b` - セルタイトル等
- **Secondary (Slate 700)**: `#334155` - セル内容等
- **Muted (Slate 400)**: `#94a3b8` - プレースホルダー、バージョン、無効状態
- **Inverted (White)**: `#ffffff` - ダーク背景上のテキスト (Timeセル、カードタイトル等)

### 3.2 アクセントカラー (Purple)
- **Light (Purple 300)**: `#d8b4fe` - ヘッダーロゴベース、アクティブ状態
- **Main (Purple 500/600)**: `#a855f7` / `#9333ea` - ロゴオーバーレイ、フッターアクティブ、フォーカス境界線

### 3.3 レア度表現 (Rarity Gradient)
- **Rare (1.0)**: `linear-gradient(135deg, #667eea, #764ba2)`
- **Common (0.0)**: 上記レア度カラーを60%の濃度で白とブレンドした淡いグラデーション
