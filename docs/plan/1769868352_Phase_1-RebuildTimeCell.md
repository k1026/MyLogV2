# 実装計画: TimeセルUIの刷新 (Phase 1)

## 概要
`docs/specs/04_CellUI.md` に基づき、TimeセルUIを一から作り直す。既存の複雑なグリッドトリック（renderAutoWidthInput）を排除し、仕様に忠実なシンプルな構造で再実装する。

## 関連仕様書
- `docs/specs/04_CellUI.md` (4.2.1 タイムセル)

## 変更内容
### 1. `app/components/cell/TimeCell.tsx` の再実装
- 既存のコードを全て削除し、新しく実装する。
- **構造**:
    - `flex flex-col gap-[2px]` のコンテナ。
    - タイトル行: `input type="text"`, `text-[14px]`, `text-white`, `placeholder:text-white/40`.
    - 値行: `flex flex-row gap-[2px]`.
        - 日付ボタン: `button`, `w-[200px]`, `text-[18px]`, `text-white`, `text-left`.
        - 時刻ボタン: `button`, `w-[100px]`, `text-[18px]`, `text-white`, `text-left`.
- **ピッカー連携**:
    - 隠し `<input type="date">` と `<input type="time">` を `ref` で保持。
    - ボタンクリック時に `showPicker()` を呼び出す。
- **保存ロジック**:
    - `onBlur` (タイトル) またはピッカーの値変更時に `onSave` を呼び出す。

## 完了条件
- 仕様通りの寸法、フォントサイズ、配置で UI が表示されること。
- 背景が透明で、枠線や角丸がないこと。
- ボタンクリックで OS 標準のピッカーが開くこと。
