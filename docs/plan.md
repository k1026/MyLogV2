# カードUI セル追加ボタン（FAB）およびパイメニューの修正計画

## 1. 要件定義

`docs/specs/05_CardUI.md` の 5.3.2.4.1 および 5.3.2.4.2 に基づき、以下の機能を実装・修正する。

### 1.1 カードFABのデザイン修正
- **形状**: 丸型
- **背景色**: 薄い紫色 (`bg-purple-200` 相当 / `#DDD6FE` など)
- **アイコン**: 白色の十字マーク (`lucide-react` の `Plus`)
- **配置**: カードUIの右下にフローティング配置

### 1.2 パイメニューの実装修正
- **起動条件**: ボタンを10ms以上長押し（`onMouseDown` から 10ms 経過）
- **項目と配置**:
  - **Text**: FABの **左側** に配置。角丸四角形、薄い紫色背景、白色のメモアイコン (`FileText`)。
  - **Task**: FABの **上側** に配置。角丸四角形、薄い紫色背景、白色のチェックリストアイコン (`CheckSquare`)。
- **操作 (ドラッグ＆リリース)**:
  - 長押しでメニューを表示。
  - そのまま指/マウスを動かして項目上で離すと、その属性のセルを追加。
  - 項目以外、または移動せずに離した場合は、短押しと同様に `Text` セルを追加、またはメニューを閉じる。

### 1.3 追加後の挙動
- **フォーカス**: 新規追加されたセルのタイトルフィールドに自動フォーカスする。
- **全選択**: フォーカス時にタイトルテキストを全選択した状態にする。

## 2. 実装ステップ

### Step 1: CardFAB コンポーネントの修正 ( app/components/card/CardFAB.tsx )
1. `lucide-react` から `FileText`, `CheckSquare` をインポート。
2. 状態管理の追加:
   - `activeItem`: ドラッグ中にホバーしている項目の追跡 ('Text' | 'Task' | null)
   - `isLongPress`: 10ms経過したかどうかのフラグ
3. インタラクション実装:
   - `onMouseDown`: 10ms のタイマーを開始。
   - `onMouseUp`: 
     - 10ms 未満なら `onAdd('Text')` を実行。
     - 10ms 以上かつ `activeItem` があればその属性で `onAdd` を実行。
     - タイマー解除、メニュー閉鎖。
   - `onMouseEnter` / `onMouseLeave` (Menu Item): `activeItem` を更新。
4. スタイリングの適用。

### Step 2: フォーカス制御の実装
1. `Card.tsx` で最後に作成されたセルIDを保持する状態 (`lastAddedId`) を追加。
2. `addCellToCard` 完了時に `lastAddedId` を更新。
3. `CellContainer` に `isNew`: boolean プロップスを追加し、`lastAddedId` と一致する場合に true を渡す。
4. `TextCell`, `TaskCell` で `isNew` が true の場合、`useEffect` でマウント時に `input.focus()` および `input.select()` を実行。

### Step 3: テストの更新
1. `CardFAB.test.tsx` の閾値を 500ms から 10ms に修正。
2. ドラッグ＆リリース（MouseDown -> Move to Item -> MouseUp）のテストケースを追加。

## 3. スケジュール

1. `CardFAB.tsx` のロジックとデザイン修正
2. `Card.tsx` およびセルコンポーネントのフォーカス制御追加
3. `CardFAB.test.tsx` の修正と実行確認
