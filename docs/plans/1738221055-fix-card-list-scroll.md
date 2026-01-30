# 1738221055-fix-card-list-scroll

## 概要
カードリストのスクロール不具合（展開時の表示崩れ、消失、位置ズレ）を解消するため、仮想スクロールの実装を刷新します。UIStateContextの大規模改修は行わず、スクロールイベントを適切に伝搬させることでヘッダー・フッターの表示制御を維持します。

## 要件
1. **仮想スクロールの安定化**: 固定高さ前提の独自実装から、動的な高さ変更に対応したライブラリ (`react-virtuoso`) へ移行する。
2. **スクロール位置の制御**: カードの展開 (`Expand`) および折りたたみ (`Collapse`) 時に、対象カードの上端が画面上部に合うようスクロール位置を調整する。
3. **表示制御の維持**: 仮想スクロール導入後も、スクロール量に応じてヘッダー/フッターの表示/非表示が切り替わる既存の挙動を維持する。

## 手順

### Step 1. ライブラリの導入
- [ ] `npm install react-virtuoso` を実行し、パッケージを追加する。
- [ ] 型定義が必要な場合は `@types/react-virtuoso` も確認する（通常は本体に含まれる）。

### Step 2. CardList のリファクタリング (仮想スクロール移行)
- File: `app/components/CardList/CardList.tsx`
- [ ] `react-virtuoso` から `Virtuoso` (リスト用) および `VirtuosoGrid` (グリッド用) をインポートする。
- [ ] 既存の独自仮想スクロールロジック（`scrollTop`, `startIndex`, `slice`, `handleScroll` 等）を削除する。
- [ ] `CardList` コンポーネントの構造を変更:
    - **共通設定**:
        - `Virtuoso` コンポーネントに `useWindowScroll` オプションの使用を検討するか、あるいは `CardList` 自身の `height` を親要素に追従させ、内部スクロールを行うかを決定する（現状は `overflow-y-auto` なため内部スクロールが自然）。
        - `scrollerRef` または `onScroll` プロパティを使用し、スクロールイベントを `useUIState().handleScroll` に渡すことで、ヘッダー/フッター制御を維持する。
    - **リストビュー (`viewMode === 'list'`) 実装**:
        - `Virtuoso` コンポーネントを使用。
        - `itemContent` プロパティで `Card` をレンダリング。
    - **グリッドビュー (`viewMode === 'grid'`) 実装**:
        - `VirtuosoGrid` を使用、または`Virtuoso`で2カラム分のデータを1行として扱うアダプタロジックを実装する（高さ可変グリッドのため、`VirtuosoGrid`よりも行単位レンダリングの方が安定する場合がある）。今回は実装の容易さと安定性から「2アイテムを1行にまとめる」データ変換ロジック + `Virtuoso` の採用を第一候補とする。
- [ ] **スクロール制御の実装**:
    - `Virtuoso` の `ref` を取得する。
    - `handleExpand`: 
        - `virtuosoRef.current.scrollToIndex({ index, align: 'start', behavior: 'smooth' })` を実行。
    - `handleCollapse`: 
        - 折りたたみ後も位置を見失わないよう、同様に `scrollToIndex` を実行。

### Step 3. Card コンポーネントの調整
- File: `app/components/card/Card.tsx`
- [ ] `Card` コンポーネントが `forwardRef` を受け取れるか確認し、必要なら実装する（`Virtuoso`の計測用）。
- [ ] Z-index の挙動を確認。展開時に `z-50` となっているが、スクロールしてヘッダー（`z-50`）と重なった場合に問題ないか確認。必要であればヘッダーの Z-index を `z-100` 等に引き上げる（これは別タスクあるいは微修正として行う）。

### Step 4. 動作確認
- [ ] カードを展開した際に、長いコンテンツでも途切れることなく表示されるか。
- [ ] スクロール時にヘッダー/フッターが隠れ、停止・上スクロールで表示されるか。
- [ ] 展開/折りたたみ時にスクロール位置が対象カードに吸着するか。
