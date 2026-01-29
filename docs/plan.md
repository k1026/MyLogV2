# Cellクラス化 実装計画

`docs/specs/02_CellDataStructure.md` の仕様に基づき、現在 `type` (エイリアス) として定義されている `Cell` を `class` に変更し、メソッドとして振る舞いを実装します。

## 変更の影響範囲
- **Model**: `app/lib/models/cell.ts`
- **DB Layer**: `app/lib/db/operations.ts`
- **Logic**: `app/components/card/cardUtils.ts` (ID管理ロジックの移譲)
- **Tests**: `*.test.ts`, `*.test.tsx` (オブジェクトリテラルでの生成箇所すべて)

## 実装手順

### Phase 1: モデル定義とDB層の修正

1.  **`app/lib/models/cell.ts` のクラス化**
    -   `type Cell` を廃止し、`class Cell` を定義する。
    -   コンストラクタを実装し、Zodスキーマ (`CellSchema`) を利用したバリデーションまたは初期化を行う。
    -   仕様にある `addCellId`, `removeCellId` メソッドを実装する（Card属性用）。
    -   `createCellId` 等のヘルパー関数との関連性を整理する。

2.  **`app/lib/db/operations.ts` のマッピング修正**
    -   `mapFromDB` メソッドを更新し、オブジェクトリテラルではなく `new Cell(...)` でインスタンスを返すように修正する。
    -   `mapToDB` はクラスインスタンスからプロパティを読み取る形式に変更（変更不要の可能性高いが念のため確認）。

### Phase 2: ロジックの移行と修正

3.  **`app/components/card/cardUtils.ts` の修正**
    -   `createCard`, `addCellToCard` 等で `Cell` を生成する際、`new Cell(...)` を使用するように修正する。
    -   Cardのvalue（子IDリスト）操作ロジックを、`Cell` クラスのメソッド (`addCellId`, `removeCellId`) 呼び出しに置き換える。
    -   注: DBへの保存処理は `cardUtils` 側に残すが、値の計算はクラスメソッドに委譲する。

### Phase 3: テストコードの適応（大規模修正）

4.  **Helper/Utilsのテスト修正 (`app/lib/**/*.test.ts`)**
    -   `models/cell.test.ts`: クラスの挙動（メソッド含む）を検証するテストを追加・修正。
    -   `db/operations.test.ts`: DBから取得したオブジェクトが `Cell` インスタンスであることを検証。

5.  **Component/Hookのテスト修正 (`app/components/**/*.test.tsx`, `app/hooks/**/*.test.ts`)**
    -   コンパイルエラーとなる「オブジェクトリテラルによるCell生成」箇所を `new Cell(...)` に置換する。
    -   対象ファイル:
        -   `useCardList.test.ts`
        -   `RarityContext.test.tsx`
        -   `DbViewer.test.tsx`
        -   `TimeCell.test.tsx`, `TextCell.test.tsx`, `TaskCell.test.tsx`
        -   `CellContainer.test.tsx`
        -   `Card.test.tsx`, `CardList.test.tsx`
        -   その他 `Cell` オブジェクトモックを使用している全てのテスト

## 注意事項
- **Reactの不変性**: `Cell` クラスのメソッドが内部状態を変更する場合、Reactの再レンダリングをトリガーするために、明示的に新しいインスタンスを生成するか (`clone`等)、更新後にステートをセットし直す運用を徹底する。
