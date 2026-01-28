# 実装計画: Card UI (カードUI)

本文書は、`docs/specs/05_CardUI.md` に基づくカードUIの実装計画である。
Cardは複数のCell (Time, Text, Task) を束ねるコンテナであり、ユーザー操作の基本単位となる。

## 1. 仕様分析と要件定義

### 1.1 仕様概要
- **構造**: `Card` 属性のCell。`value` に子セルのIDリストを保持。
- **状態**:
  - **折りたたみ (Default)**: プレビュー表示 (Time, Title)。
  - **展開 (Expanded)**: 子セル詳細表示、編集可能。
- **自動処理**:
  - 作成時に `Time` (現在時刻) と `Text` (空) を自動追加。
  - 折りたたみ時に空の `Task`, `Text` セルを削除 (Clean up)。
- **ソート機能**:
  - 生成日時 (Asc/Desc)。
  - タスク状態 (未完了/完了優先)。
  - **手動ソート (Drag & Drop)**: `Card.value` の順序を物理的に変更。
- **UI/UX**:
  - FAB (Floating Action Button) でセル追加。
  - 長押しでメニュー (Pie Menu / Context Menu)。
  - **背景色**: 子セルの平均レア度 (Rarity) に連動。

### 1.2 依存関係・前提条件
- **DB層**: `CellRepository` の参照・更新。
- **既存コンポーネント**: `TimeCell`, `TextCell`, `TaskCell` の再利用。
- **Rarity**: `useRarity` (または Context) からレア度情報を取得可能であること。
- **Style**: Tailwind CSS を使用。

---

## 2. 実装ステップ (SAT-DD)

### Step 1: Cardコンポーネントの基盤作成と表示
- **目的**: Cardの基本的な表示 (折りたたみ/展開) とデータ連携を確認する。
- **Action**:
  1. `app/components/card/Card.tsx` 作成。
  2. **Props定義**: `cell: Cell` (Card属性), `onUpdate: (cell: Cell) => void` 等。
  3. **State管理**: `isExpanded` (boolean)。
  4. **折りたたみ表示**:
     - `Card.value` から先頭のセル(Time以外)を取得しタイトル表示。
     - 右上に生成日時 (`Card.id` 由来) 表示。
  5. **展開表示 (リスト)**:
     - `Card.value` に含まれる IDリストを解析。
     - `CellRepository` (または `useLiveQuery` via Dexie) を使用して子セルデータを取得。
     - リストレンダリング (仮実装)。
  6. **テスト**:
     - 親から渡された `Card` データが正しく表示されるか。
     - クリックで `isExpanded` が切り替わるか。

### Step 2: 自動処理とデータ整合性 (Auto-Element & Clean-up)
- **目的**: Card作成時のデフォルト状態と、閉じた時のクリーンアップ処理を実装。
- **Action**:
  1. **作成時ロジック**:
     - Card作成関数 (`createCard` helper) を実装。
     - `Time` セル作成 -> `Text` セル作成 -> `Card` の `value` に追加。
     - IDが時間順になるよう `1ms` 待機処理。
  2. **Clean-upロジック**:
     - `useEffect` または `onCollapse` イベントで発火。
     - 空の `Task` (name空), `Text` (name&value空) を検出し、DBから削除 & Cardのvalueから除外。
  3. **テスト**:
     - `createCard` が正しい初期構造 (Card > Time, Text) を返すか。
     - 空のセルを持つカードを閉じた時、それらが削除されるか。

### Step 3: ソート機能とツールバーの実装
- **目的**: 複雑なソートロジックと手動並べ替えの下地を作る。
- **Action**:
  1. **ツールバーUI**: 展開時にヘッダー部分にアイコン (Sort, Task, Manual) を配置。
  2. **ソートロジック実装 (Hook: `useCardSort`)**:
     - `Time` セルは常に先頭維持。
     - **日時ソート**: ID比較。
     - **タスクソート**: Taskセルの `value` (done/not done) 比較。
  3. **手動ソート (Manual)**:
     - UIライブラリ (dnd-kit 等) 導入検討、またはシンプルな実装。今回は基本実装で進行。
     - 並べ替え確定時、**`Card.value` のID順序を書き換えて保存**する処理。
  4. **テスト**:
     - 各ソートモードで表示順が期待通り変わること。
     - Manualソート実行後、DB内の `Card.value` が更新されていること。

### Step 4: FABとセル追加機能
- **目的**: ユーザーがCardに新しい情報を追加できるようにする。
- **Action**:
  1. **FAB (Floating Action Button)** 配置 (展開時のみ)。
  2. **追加ロジック**:
     - ボタンクリック -> 新規セル (Default: Text?) 追加。
     - 現在のソート順、または末尾に追加。
     - **フォーカス制御**: 追加直後にそのセルのタイトル入力欄へフォーカス。
  3. **パイメニュー (簡易版)**:
     - 長押し判定フック。
     - `Text` / `Task` 選択メニュー表示。
  4. **テスト**:
     - 追加ボタンでセルが増えるか。
     - 追加されたセルにフォーカスが当たるか。

### Step 5: デザイン研磨とRarity連携
- **目的**: 仕様書通りの「Wow」なデザインとレア度連携。
- **Action**:
  1. **Rarity連携**:
     - 子セルの平均レア度計算 (Card, Time 除外)。
     - 背景色への反映 (Gradient)。
  2. **スタイル調整**:
     - Glassmorphism, 影, アニメーション (展開時のTransition)。
     - 削除済み (Remove) 状態のスタイル (打ち消し線)。
  3. **仮想スクロール (Virtual Scroll)**:
     - *※Optional/Advanced*: 基本実装完了後に導入検討。

---

