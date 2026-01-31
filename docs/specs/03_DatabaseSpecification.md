# 3. データベース仕様

このドキュメントでは、アプリケーションが使用するローカルデータベースの構成とデータ構造について記述します。

# レイアウト

- **[データベース]**：MyLogV2DB
  - **[ストア：cells]**
    - 🔑 **プライマリキー**：`&I` (ID)
    - 🔢 **バージョン**：1
    - 📦 **データ構造**：`CellDB` (短縮キー形式)
      - `I`：id (string, Primary Key)
      - `A`：attribute (string)
      - `N`：name (string)
      - `V`：value (string)
      - `G`：geo (string | null)
      - `R`：remove (string | null)

## 共通仕様

**名称**：データベース基盤、
**種類**：IndexedDB (via Dexie.js)、
**用途**：ローカルデータの永続化、
**挙動**：
- **シングルトン**: `globalThis` を使用し、Next.js開発環境等での多重接続を防止する（`db.ts` 参照）。
- **データ整合性**: 保存時に `Zod` スキーマ（`CellSchema`）による検証を実施する。
- **短縮キー**: ストレージ容量節約のため、DB保存時はプロパティ名を1文字に短縮する（`operations.ts` 参照）。

# データベース操作 (個別仕様)

データベース操作は `app/lib/db/operations.ts` の `CellRepository` オブジェクトを通じて行います。

### save(cell)
**名称**：保存・更新、
**種類**：非同期メソッド、
**用途**：CellオブジェクトをDB形式に変換して保存(Upsert)、
**引数**：`cell: Cell`、
**戻値**：`Promise<void>`、
**挙動**：`mapToDB` で短縮キー形式に変換後、`db.cells.put` を実行する。

### getById(id)
**名称**：ID検索、
**種類**：非同期メソッド、
**用途**：IDを指定して特定のCellを取得、
**引数**：`id: string`、
**戻値**：`Promise<Cell | undefined>`、
**挙動**：IDに合致するレコードを取得し、`mapFromDB` で正規形式に変換して返す。存在しない場合は `undefined` を返す。

### getByIds(ids)
**名称**：複数ID検索、
**種類**：非同期メソッド、
**用途**：IDの配列を指定して複数のCellを一括取得、
**引数**：`ids: string[]`、
**戻値**：`Promise<Cell[]>`、
**挙動**：`db.cells.bulkGet` を使用して取得し、有効なデータのみを正規形式に変換して返す。

### getAll()
**名称**：全件取得、
**種類**：非同期メソッド、
**用途**：すべてのCellをIDの降順（新しい順）で取得、
**引数**：なし、
**戻値**：`Promise<Cell[]>`、
**挙動**：`orderBy('I').reverse()` で全件取得する。

### getCount()
**名称**：総数取得、
**種類**：非同期メソッド、
**用途**：保存されている全Cellの総数を取得、
**引数**：なし、
**戻値**：`Promise<number>`、

### getRange(offset, limit)
**名称**：範囲取得、
**種類**：非同期メソッド、
**用途**：ページネーション用の範囲指定取得（ID降順）、
**引数**：`offset: number, limit: number`、
**戻値**：`Promise<Cell[]>`、

### getAllKeys(direction)
**名称**：全キー取得、
**種類**：非同期メソッド、
**用途**：全データのプライマリキー（ID）のみを取得、
**引数**：`direction: 'next' | 'prev'` (デフォルト: 'prev')、
**戻値**：`Promise<string[]>`、

### processAllInBatches(batchSize, callback)
**名称**：バッチ処理、
**種類**：非同期メソッド、
**用途**：大量データをメモリ効率よく処理、
**引数**：`batchSize: number, callback: (cells: Cell[]) => Promise<void>`、
**戻値**：`Promise<void>`、
**挙動**：ID降順でスキャンし、指定サイズごとにコールバックを実行する。

### getCards(offset, limit)
**名称**：カード取得、
**種類**：非同期メソッド、
**用途**：カード属性（`Card`）のセルのみを範囲取得（ID降順）、
**引数**：`offset: number, limit: number`、
**戻値**：`Promise<Cell[]>`、
**挙動**：`.filter(doc => doc.A === 'Card')` を適用して取得する。

### getCardCount()
**名称**：カード総数取得、
**種類**：非同期メソッド、
**用途**：カード属性セルの総数を取得、
**引数**：なし、
**戻値**：`Promise<number>`、

### getRecentCells(limit, exclude)
**名称**：最新セル取得、
**種類**：非同期メソッド、
**用途**：指定した属性を除外して最新のセルを取得、
**引数**：`limit: number, excludeAttributes: CellAttribute[]`、
**戻値**：`Promise<Cell[]>`、

### delete(id)
**名称**：削除、
**種類**：非同期メソッド、
**用途**：IDを指定してCellを物理削除、
**引数**：`id: string`、
**戻値**：`Promise<void>`、

### clearAll()
**名称**：全削除、
**種類**：非同期メソッド、
**用途**：ストア内の全データを削除、
**引数**：なし、
**戻値**：`Promise<void>`、

### exportAsJSONL(onProgress, signal)
**名称**：エクスポート、
**種類**：非同期メソッド、
**用途**：データをJSONL形式の文字列として出力、
**引数**：`onProgress?: (percent: number) => void, signal?: AbortSignal`、
**戻値**：`Promise<string>`、
**挙動**：
- 全データを取得し、行ごとにJSON文字列化する。
- 100件ごとに `setTimeout(0)` でイベントループを解放する。
- `signal` による中断時は例外（`Aborted`）をスローする。

### importFromJSONL(jsonl, onProgress, signal)
**名称**：インポート、
**種類**：非同期メソッド、
**用途**：JSONL形式の文字列をパースしてDBに保存、
**引数**：`jsonl: string, onProgress?: (percent: number) => void, signal?: AbortSignal`、
**戻値**：`Promise<ImportResult>`、
**挙動**：
- `CellSchema` で検証しつつ `save` を実行する。
- 50件ごとにループを解放する。
- 個別行のエラーは `ImportResult` に記録し処理を継続する。
- `signal` による中断時は例外（`Aborted`）をスローする。

# ロジック仕様

## データマッピング
ストレージ容量節約のため、保存時にプロパティ名を短縮キーにマッピングします。定義は `@docs/specs/02_CellDataStructure.md` に準じます。
- `mapToDB(cell)`: `Cell` → `CellDB` (短縮名)
- `mapFromDB(doc)`: `CellDB` → `Cell` (正規名)

## ファイル入出力
バックアップ・復元用に JSONL (JSON Lines) 形式をサポートします。

### インポート結果 (`ImportResult`)
```typescript
interface ImportResult {
    successCount: number;   // 成功件数
    failureCount: number;   // 失敗件数
    errors: string[];       // エラー詳細（行ごとのエラーメッセージ）
}
```
※UI（`DbViewer`）側では、中止時に成功・失敗・中止の各件数を表示するために、読み込み行数との差分を計算して利用します。
