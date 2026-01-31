# 実装計画: TimeセルUIの刷新 (Phase 2)

## 概要
刷新された TimeセルUI に合わせて、既存のテストコード `app/components/cell/TimeCell.test.tsx` を更新する。

## 関連仕様書
- `docs/specs/04_CellUI.md` (4.2.1 タイムセル)

## 変更内容
### 1. `app/components/cell/TimeCell.test.tsx` の更新
- **初期表示テスト**: 
    - `getByLabelText(/date/i)` 等がボタンを返すようになるため、アサーションを調整。
    - 幅（200px, 100px）のチェックを追加。
- **UI要件テスト**:
    - クラス名のアサーションを、新しい実装に合わせて更新（`w-full` ではなく `w-[200px]` など）。
- **イベントテスト**:
    - ボタンクリックでピッカーが開くことのテスト。
    - ピッカー変更時の `onSave` 呼び出しのテスト。

## 完了条件
- 全ての `TimeCell.test.tsx` がパスすること。
