# セルタイトル推定処理の呼び出し方法およびUI修正計画

## 1. 目的
セル追加時のユーザー体験を向上させるため、推定タイトルの自動セット機能と、候補をチップ形式で表示する新しい選択UI（タイトル候補サジェスト）を導入します。

## 2. 実装計画

### Step 1: タイトル候補表示用コンポーネントの作成
- **ファイル**: `app/components/cell/TitleCandidates.tsx`
- **内容**:
    - 推定候補を受け取り、水平スクロール可能なチップのリストを表示する。
    - 各候補タップ時の `onSelect` コールバックを実装。
    - プレミアム感を出すため、アニメーション（Framer Motionなどは使用せず標準CSS/Tailwind）を適用。

### Step 2: TextCell への統合
- **ファイル**: `app/components/cell/TextCell.tsx`
- **内容**:
    - `useCellTitleEstimation` を使用して `isNew` 時に推定を実行。
    - 最上位候補を `setName` で初期セット。
    - `TitleCandidates` コンポーネントを入力フィールドの上に配置。
    - `onChange` やフォーカス移動時に候補表示を隠すステート管理（`showCandidates`）。
    - 既存の `datalist` 関連コードの削除。

### Step 3: TaskCell への統合
- **ファイル**: `app/components/cell/TaskCell.tsx`
- **内容**:
    - `TextCell` と同様の統合を行う。
    - `nameRef.current.select()` と自動セットのタイミングを調整。

### Step 4: 動作確認 (手動)
- カードに新しい Text/Task セルを追加し、以下の点を確認する。
    - タイトルが自動で入ること。
    - 入ったタイトルが全選択状態であること。
    - 上部に候補が表示されること。
    - 候補タップでタイトルが変わり、表示が消えること。
    - 入力開始で表示が消えること。

## 3. 影響範囲
- `app/components/cell/TextCell.tsx`: 推定ロジックの呼び出しとUI追加。
- `app/components/cell/TaskCell.tsx`: 推定ロジックの呼び出しとUI追加。
- `docs/specs/10_CellTitleEstimation.md`: 仕様の反映（完了済み）。

## 4. リスク・留意点
- `useCellTitleEstimation` の `estimate()` は非同期なため、マウント直後の `setName` と `select()` のタイミングが重要。
- `TaskCell` は横並びレイアウトのため、候補表示の位置（絶対配置 vs 相対配置）を慎重に調整。
