# フェーズ2: カードツールバーUIの修正 (修正版)

ツールバーの背景透明化、新しいアイコン、および2状態時間ソートの視覚表現を修正します。

## 関連仕様書
- `docs/specs/05_CardUI.md`

## 実装手順

### 1. `app/components/card/CardToolbar.tsx` の修正
- ツールバー背景: `bg-white/10 backdrop-blur-md` クラスを削除。
- 時間ソートアイコン (`schedule`):
    - `sortMode === 'desc'` (NEW): アクティブ表示（`bg-white/20`, 文字色白, ラベル表示）。
    - `sortMode === 'asc'` (OLD): 非アクティブ表示（背景なし, 透過度50%, ラベル非表示）。
- タスクソートアイコン:
    - 状態 `complete` (DONE): アイコン `vertical_align_top`、ラベル `DONE`、アクティブ表示。
    - 状態 `incomplete` (TODO): アイコン `vertical_align_bottom`、ラベル `TODO`、アクティブ表示。
    - 状態 `none`: アイコン `vertical_align_top`（デフォルト）、ラベル非表示、非アクティブ表示。

### 2. テストの修正
- `app/components/card/CardToolbar.test.tsx`:
    - 背景クラスの欠如（透明）を検証。
    - アイコンが `vertical_align_top/bottom` に切り替わることを検証。
    - ラベルが `DONE/TODO` であることを検証。
    - 時間ソートのアクティブ/非アクティブ状態のスタイルを検証。
