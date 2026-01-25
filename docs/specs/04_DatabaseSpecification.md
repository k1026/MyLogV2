# 3. データベース仕様

このドキュメントでは、アプリケーションが使用するIndexedDBの構成とデータ構造について記述します。

## 基本構成

| 項目 | 値 | 説明 |
| :--- | :--- | :--- |
| **DB Name** | `MyLogDB` | データベース名 |
| **Version** | `3` | DBバージョン |
| **Store Name** | `cells` | オブジェクトストア名 |

## スキーマ定義

- **Type**: `IndexedDB`
- **Key Path**: `I` (Cell ID)
- **Auto Increment**: `false`

### インデックス

| インデックス名 | キーパス | ユニーク | 説明 |
| :--- | :--- | :--- | :--- |
| `I` | `I` | true | Cellの一意な識別子 |

## データマッピング

ストレージ容量の節約等のため、DB保存時にはプロパティ名が短縮形にマッピングされます。

| DBキー | アプリ内プロパティ | 型 | 説明 |
| :--- | :--- | :--- | :--- |
| `I` | `id` | string | 一意なID (Timestamp + Random) |
| `A` | `attribute` | string | セルの種類 (Card, Time, Text, Task) |
| `N` | `name` | string | セルの名前/タイトル |
| `V` | `value` | string | セルの値 |
| `G` | `geo` | string \| null | 位置情報 (緯度 経度 高度) |
| `R` | `remove` | string \| null | 削除フラグ (削除時のタイムスタンプ文字列) |

## 操作インターフェース (`src/utils/db.js`)

`window.db` (クラス: `CellDatabase`) を通じて以下の非同期操作を提供します。
すべてのメソッドは `Promise` を返します。

- **`open()`**: データベースを開く（バージョンアップ時のマイグレーションも処理）。
- **`save(cell)`**: `Cell` オブジェクトをDB形式(`I`, `A`...)に変換して保存または更新する。
- **`getById(id)`**: IDを指定して特定のセルを取得し、`Cell` オブジェクト形式に戻して返す。
- **`getByIds(ids)`**: IDの配列を指定して複数のセルを取得する。
- **`getAll()`**: すべてのセルをIDの降順（新しい順）で取得する。
- **`delete(id)`**: IDを指定してセルを物理削除する。
- **`clearAll()`**: ストア内の全データを削除する。
- **`getCount()`**: 保存されているセルの総数を取得する。
- **`getRange(offset, limit)`**: ページネーション等のために範囲指定で取得する。
- **`getAllKeys(direction)`**: 保存されている全データのキー(ID)のみを取得する。`direction`で順序指定可能('next'|'prev')。
- **`processAllInBatches(batchSize, callback, direction)`**: 全データをバッチサイズごとに分割して処理する。
  - 堅牢性のため、内部で`getAllKeys`により全キーを取得した後、`getByIds`でデータを取得する方式を採用。
  - バックグラウンドでの大量データ処理時にトランザクション切れを防ぐ。
