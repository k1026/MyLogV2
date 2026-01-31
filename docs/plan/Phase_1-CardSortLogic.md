# フェーズ1: カードソートロジックの修正 (修正版)

カードツールバーの仕様変更に基づき、時間ソートの2状態化とタスクソートの「先頭・末尾グループ化」ロジックを実装します。

## 関連仕様書
- `docs/specs/05_CardUI.md`

## 実装手順

### 1. `app/contexts/CardSortContext.tsx` の修正
- `ToggleSort` の挙動変更: `desc` (有効) と `asc` (無効) の2状態をトグルするように修正。
- `TaskSortMode` 型: `'none' | 'complete' | 'incomplete'` は維持するが、遷移を `none -> complete -> incomplete -> none` に修正。
- 初期状態: `sortMode` を `desc` (有効) に設定。

### 2. `app/components/card/useCardSort.ts` の修正
- 時間ソート: `sortMode` が `'desc'` でも `'asc'` でも常に適用する（ただし手動ソート時は除く）。
- タスクソートロジックの変更:
    - `complete` (DONE): 完了タスク(done) -> 未完了タスク(todo) -> 非タスクセル の順で構成。（タスクを先頭グループ化）
    - `incomplete` (TODO): 非タスクセル -> 未完了タスク(todo) -> 完了タスク(done) の順で構成。（タスクを末尾グループ化）
    - 各グループ内では常に時間ソートを維持する。

### 3. テストの修正
- `app/contexts/CardSortContext.test.tsx`: 2状態トグルおよび3状態ループのテストを更新。
- `app/components/card/useCardSort.test.tsx`: 新しいグループ化ロジックに基づく期待値（タスクが先頭か末尾か）を更新。
