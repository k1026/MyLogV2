# フィルタ機能実装計画

## 概要
`docs/specs/15_Filter.md` に基づき、カードリストのフィルタリング機能を実装します。
現在のアプリケーション構成では `useCardList` がカード情報を取得し `CardList` コンポーネントで表示していますが、フィルタリングには「カードの子セル（Text/Taskなど）の内容」による判定が必要です。
そのため、データ取得ロジックを拡張し、全セルのデータをメモリ上に保持（クライアントサイド検索）する方式を採用します。

## 実装ステップ

### Step 1: Contextと型定義の作成
フィルタの状態管理を行う `FilterContext` を作成し、アプリケーション全体でフィルタ設定を共有可能にします。

- **ファイル**: `app/lib/models/filter.ts` (新規)
  - `FilterSettings` インターフェース定義
- **ファイル**: `app/contexts/FilterContext.tsx` (新規)
  - `FilterContext` 作成
  - `filterSettings` state の管理
  - `Attribute` (Text, Task, Remove), `Keyword` (Include, Exclude), `DateRange` の管理

### Step 2: データ取得ロジックの拡張
フィルタリングにはサプセル（可視セル以外の全データ）へのアクセスが必要です。`useCardList` を改修し、カードだけでなく紐づく全セルを取得するように変更します。

- **ファイル**: `app/lib/db/operations.ts`
  - `getAllCells()` メソッドの追加（全セル取得用）
  - または既存の `getCards` とは別に `getRelatedCells` を実装
- **ファイル**: `app/hooks/useCardList.ts`
  - カード取得時に（バックグラウンドまたは一括で）全セル情報をロードし、`subCellMap` (Map<ID, Cell>) を構築して返すように変更
  - パフォーマンスを考慮し、バッチ処理または Dexie の `toArray` を活用

### Step 3: フィルタリングロジックの実装
純粋関数としてフィルタリングロジックを実装します。

- **ファイル**: `app/lib/filter/cardFilter.ts` (新規)
  - `filterCards(cards: Cell[], subCellMap: Map<string, Cell>, settings: FilterSettings): Cell[]`
  - 仕様 15.3 に基づくフィルタ順序の実装
    - 無効時の挙動 (Remove判定)
    - 期間フィルタ
    - 属性フィルタ
    - キーワード除外
    - キーワード抽出

### Step 4: UI実装 - フィルタダイアログ
`FilterDialog` を仕様に合わせて実装します。

- **ファイル**: `app/components/Filter/FilterDialog.tsx`
  - 属性選択ボタン (Text, Task, Remove)
  - キーワード入力 (抽出・除外) + ターゲット切替
  - 期間指定 (Date Picker連携)
  - 適用・リセットボタン
  - `FilterContext` との連携

### Step 5: 統合とハイライト機能
メイン画面への統合と、キーワードハイライト機能を実装します。

- **ファイル**: `app/page.tsx`
  - `FilterProvider` でラップ（もし `layout.tsx` でない場合）
  - `useCardList` からのデータを `filterCards` で加工してから `CardList` に渡す
- **ファイル**: `app/components/card/Card.tsx`, `CellContainer.tsx`, `TextCell.tsx`, `TaskCell.tsx`
  - ハイライト用キーワードの受け渡し（またはContext参照）
  - キーワード一致箇所のハイライト表示 (薄いオレンジ背景)

## 検証計画
- `Remove` 属性のトグル動作（削除済みカードの表示/非表示）
- 期間外のカードが非表示になること
- キーワード（名前・値・両方）での抽出と除外が正しく機能すること
- フィルタ適用後のカードリスト更新がスムーズであること
