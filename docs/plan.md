# 実装計画: カード追加ボタン機能

## 1. 概要
`docs/specs/07_CardListUI.md` の「7.7 カード追加ボタン」および「7.6 リストのソート（追加時の挙動）」に基づき、カード追加機能（FAB）を実装する。

## 2. 要件
### 2.1 UI/デザイン
- **コンポーネント**: `CardAddButton`
- **形状**: 角丸の白い四角形 (Floating Action Button)
- **アイコン**: 中央に紫の十字マーク (+)
- **配置**: カードリストの右下、画面スクロールに追従 (Fixed position)
- **表示制御**:
  - カードリスト表示時: 表示
  - カード詳細展開時 (`focusedId` が存在する場合): 非表示

### 2.2 挙動
- **クリック時**:
  1. `createCard(geo)` を呼び出し、新規カードとTime/TextセルをDBに作成。
  2. 作成されたカードをリストの**先頭**（または適切なソート位置）に追加（部分更新）。
  3. 作成されたカードを即座に「展開状態」にする（`focusedId` を設定）。
- **データ更新**:
  - ページのリロード (`window.location.reload()`) は行わず、ReactのState更新でリストに反映させる。

## 3. 実装ステップ (lightSAT-DD準拠)

### Step 1: `CardAddButton` の空実装とテスト作成
- `app/components/CardList/CardAddButton.tsx` を作成し、型定義と空のコンポーネント（nullを返す、または最小限のdiv）を実装する。
- `app/components/CardList/CardAddButton.test.tsx` を作成し、以下のテストケースを実装する。
  - レンダリングされること（classによるstyle適用確認）
  - クリック時にonClickハンドラが呼ばれること
  - `visible=false` の場合に非表示になること（またはDOMから消えること）

### Step 2: テスト実行 (Red)
- テストを実行し、実装が空であるあるいはロジック未実装のため失敗することを確認する。

### Step 3: `CardAddButton` の実装 (Green)
- `CardAddButton.tsx` を実装し、Tailwind CSSでのスタイリングとクリックイベントのハンドリングを完了させ、テストをパスさせる。

### Step 4: `useCardList` の拡張とテスト
- `app/hooks/useCardList.ts` に `addCard` メソッドを追加する（まずはインターフェース定義のみ）。
- `app/hooks/useCardList.test.tsx` (存在しない場合は作成) で `addCard` 呼び出し後に `cards` ステートが増加することを検証するテストを追加。
- `useCardList` の実装を更新し、テストをパスさせる。

### Step 5: `app/page.tsx` への統合
- `app/page.tsx` に `CardAddButton` を配置。
- `focusedId` に基づく表示切り替えロジックと、`handleNewCard` での保存・追加処理を連携させる。
- 動作確認を行い、ブラウザでFABの配置と挙動（スクロール追従、展開時非表示）を検証する。

## 4. 影響範囲
- `app/hooks/useCardList.ts`
- `app/page.tsx`
- `app/components/CardList/CardAddButton.tsx` (New)
- `app/components/CardList/CardAddButton.test.tsx` (New)
