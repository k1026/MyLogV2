

# 実装計画: Cell UI (Cell UI Implementation)

## 概要
`docs/specs/04_CellUI.md` に基づき、Cellの表示・編集を行うUIコンポーネントを実装する。

## 実装ステップ

### 1. 環境整備と共通基盤 (Setup & Common Infrastructure)
- [x] `app/components/cell/` ディレクトリ作成
- [x] 共通スタイル定義 (Tailwind CSS)
- [x] `CellContainer` コンポーネント作成 (Dispatcher logic)
- [x] **Test Plan: `CellContainer` (`app/components/cell/CellContainer.test.tsx`)**
    - [x] **Attributeによる分岐**:
        - `Attribute.Time` を持つ Cell を渡すと `<TimeCell />` (または相当するモック) がレンダリングされること
        - `Attribute.Text` を持つ Cell を渡すと `<TextCell />` がレンダリングされること
        - `Attribute.Task` を持つ Cell を渡すと `<TaskCell />` がレンダリングされること
    - [x] **Unknown Attribute**: 未知の属性が渡された場合のフォールバック（null または エラー表示）を確認

### 2. Text Cell 実装 (Text Cell Implementation)
- [x] `TextCell` コンポーネント作成
- [x] 自動高さ調整機能 (`textarea` auto-resize)
- [x] フォーカス制御ロジック
- [x] **Test Plan: `TextCell` (`app/components/cell/TextCell.test.tsx`)**
    - [x] **初期表示**: `name` と `value` が渡された値で表示されること
    - [x] **フォーカス制御 (仕様 4.2.2)**:
        - `name`, `value` 両方空の場合: `name` にフォーカス
        - `name` 入力済み, `value` 空の場合: `value` にフォーカス
        - `name` Empty, `value` 入力済みの場合: `name` にフォーカス
        - 両方入力済みの場合: `value` にフォーカス
    - [x] **入力インタラクション**:
        - `name` フィールドで Enter キー押下 -> `value` フィールドへフォーカス移動
    - [x] **自動保存**:
        - `name` 変更 -> blur -> `save` ハンドラ呼び出し確認
        - `value` 変更 -> blur -> `save` ハンドラ呼び出し確認
    - [x] **表示制御**: フォーカスが外れた状態で値が空のフィールドが非表示になること（または不可視になること）

### 3. Time Cell 実装 (Time Cell Implementation)
- [x] `TimeCell` コンポーネント作成
- [x] 文字列 <-> 日付UI 変換ロジック
- [x] **Test Plan: `TimeCell` (`app/components/cell/TimeCell.test.tsx`)**
    - [x] **データバインディング**: `value` (ISO文字列想定) が日付入力UIに正しく反映されること
    - [x] **更新**:
        - 日付を変更 -> 正しいフォーマットの文字列として `save` が呼ばれること
        - 時刻を変更 -> 正しいフォーマットの文字列として `save` が呼ばれること

### 4. Task Cell 実装 (Task Cell Implementation)
- [x] `TaskCell` コンポーネント作成
- [x] Checkbox logic
- [x] **Test Plan: `TaskCell` (`app/components/cell/TaskCell.test.tsx`)**
    - [x] **レンダリング**:
        - `value: "true"` -> チェックボックス Checked
        - `value: "false"` (または空) -> チェックボックス Unchecked
    - [x] **インタラクション**:
        - チェックボックスをクリック -> `save` が即座に呼ばれ、値が反転していること
    - [x] **タイトル編集**: `name` の編集で `save` が呼ばれること
