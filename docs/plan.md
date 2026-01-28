# 実装計画: フッター (12_Footer.md)

## 1. 概要
アプリケーション下部に固定表示される操作バー（フッター）を実装します。ソート切り替え、フィルタ、ビュー切り替えの3つの機能セクションを持ち、スクロール方向や入力フォーカス状態に応じて表示・非表示が自動制御されます。

## 2. 影響範囲
- `app/layout.tsx`: 新しいコンテキストプロバイダーの追加
- `app/components/Header/`: ソート中表示の追加
- `app/components/CardList/`: ビューモード対応（グリッド表示）
- `app/hooks/useCardList.ts`: ソートロジックの追加
- 新規作成: フッターコンポーネント一式、共通状態管理コンテキスト、表示制御用フック

## 3. 実装ステップ (1ステップ・1ファイル・1関数を原則)

### Step 1: UI状態管理の基盤作成 (TDD)
フッターの操作をアプリ全体に共有するためのコンテキストを作成します。

1. **[TEST]** `app/contexts/__tests__/UIStateContext.test.tsx` の作成
   - `sortOrder` の初期値が 'desc' であること
   - `viewMode` の初期値が 'list' であること
   - 各トグル関数が正しく状態を更新すること
2. **[CODE]** `app/contexts/UIStateContext.tsx` の作成
   - `UIStateProvider` を定義
   - `sortOrder` ('asc' | 'desc'), `viewMode` ('list' | 'grid'), `filterState` ('off' | 'on' | 'disabled') を管理
3. **[CODE]** `app/layout.tsx` への適用
   - `UIStateProvider` で全体をラップする

### Step 2: 自動表示制御ロジックの共通化
Headerにあるロジックを抽出し、Footerでも利用可能にします。

1. **[TEST]** `app/hooks/__tests__/useAutoVisibility.test.ts` の作成
   - スクロールダウンで `isVisible` が false になること
   - スクロールアップで `isVisible` が true になること
   - インプットフォーカス中に `isVisible` が false になること
2. **[CODE]** `app/hooks/useAutoVisibility.ts` の作成
3. **[CODE]** `app/components/Header/Header.tsx` のリファクタリング
   - 重複ロジックを `useAutoVisibility` に置き換え

### Step 3: フッターの基本構造
1. **[CODE]** `app/components/ui/Footer/Footer.tsx` の作成
   - 基本レイアウト（左右中セクション）の実装
   - `useAutoVisibility` によるアニメーション制御
2. **[CODE]** `app/components/ui/Footer/FooterButton.tsx` の作成
   - フッター内で共通利用するスタイルのボタンコンポーネント

### Step 4: ソート機能の実装
1. **[CODE]** `app/components/ui/Footer/SortButton.tsx` の作成
   - `UIStateContext` の `sortOrder` に応じたアイコン表示とトグル。
2. **[CODE]** `app/components/Header/HeaderActions.tsx` の更新
   - `isSorting` プロップを追加し、紫色アイコンと "sorting" 文字の表示に対応。
3. **[CODE]** `app/hooks/useCardList.ts` の更新
   - `sortOrder` を監視し、データ読み込み済みのカードをメモリ上で即時ソートするロジックの追加。

### Step 5: ビュー切り替え機能の実装
1. **[CODE]** `app/components/ui/Footer/ViewModeButton.tsx` の作成
   - リスト/グリッドのアイコン切り替え。
2. **[CODE]** `app/components/CardList/CardList.tsx` の更新
   - `viewMode` が 'grid' の場合に 2列（`grid-cols-2`）になるようレイアウトを調整。

### Step 6: フィルタ機能のモック実装
1. **[CODE]** `app/components/ui/Footer/FilterButton.tsx` の作成
   - Off / On / Disabled の3状態のスタイル表示。
2. **[CODE]** `app/components/Filter/FilterDialog.tsx` の作成 (初期版)
   - プレースホルダとしてのダイアログ表示。

### Step 7: 最終調整
1. **[CODE]** `app/page.tsx` への `Footer` 配置。
2. デザインの微調整（Z-index、背景のブラー効果、余白など）。

## 4. 完了定義
- [ ] フッターが画面下部に固定されている。
- [ ] スクロールダウンで隠れ、スクロールアップ/入力フォーカス解除で表示される。
- [ ] ソートボタンでリストの順序が入れ替わり、ヘッダーに "sorting" が表示される。
- [ ] ビュー切り替えボタンで 1列と 2列が切り替わる。
- [ ] フィルタボタンが状態（Off/On/Disabled）に応じて色を変える。
