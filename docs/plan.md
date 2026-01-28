# 実装計画: データベース ファイル入出力機能 (DB File I/O)

## 概要
`docs/specs/03_DatabaseSpecification.md` の更新に基づき、データベースの全データを JSONL 形式でエクスポートおよびインポートする機能を実装する。データのバックアップとリストアを主目的とし、ファイルサイズの最小化と処理効率を重視して DB内部形式（短縮キー）を利用する。

## 要件定義
### 1. エクスポート機能 (`exportAsJSONL`)
- **対象データ**: DB内の全ての `Cell` データ。
- **出力形式**: JSONL (JSON Lines)。各行が1つの `CellDB` オブジェクト（`I`, `A`, `N`, `V`...）を表す。
- **データ変換**:
    - **なし**。DBから取得した生データをそのまま出力する。
    - これにより、アプリケーション型への変換コストを削減する。
- **戻り値**: 全データを結合した文字列 (`string`)。

### 2. インポート機能 (`importFromJSONL`)
- **入力**: JSONL 形式の文字列。
- **処理フロー**:
    1. 文字列を行単位に分割。
    2. 空行を無視。
    3. 各行を JSON パース (結果は `any` -> `CellDB` と仮定)。
    4. **変換**: `CellRepository.mapFromDB` を使用して `Cell` オブジェクトに変換。
    5. **検証**: `CellSchema` (Zod) を用いて `Cell` オブジェクトをバリデーション。
    6. **保存**: Validなデータについて、`CellRepository.save` (内部で再度 `mapToDB` が行われるが、安全のため許容) を用いて DB に保存 (Upsert)。
- **エラーハンドリング**:
    - パースエラー、マッピングエラー、バリデーションエラーが発生した行はスキップする。
    - 処理結果として `ImportResult` (成功数、失敗数、エラー詳細配列) を返す。
- **注意点**: インポートデータが信頼できるバックアップデータである場合が多いが、スキーマ変更等への対応のため、必ずモデルバリデーションを通すこととする。

### 3. 対象ファイル
- `app/lib/db/operations.ts`: `CellRepository` へのメソッド追加。
- `app/lib/db/types.ts`: `ImportResult` 型の定義（必要であれば）。

## 実装ステップ

### Step 1: テスト作成 (Test First)
- **Target**: `app/lib/db/fileIO.test.ts` (新規作成)
- **Action**:
    - `exportAsJSONL` のテストケース作成:
        - DBにデータを投入。
        - エクスポート結果が `I`, `A`, `N` などのキーを持つ JSONL であることを検証。
    - `importFromJSONL` のテストケース作成:
        - 正常系: `I`, `A` キーを持つ JSONL を読み込ませ、DB に正しくデータが格納されるか検証（アプリ形式で取得できるか確認）。
        - 異常系:
            - 不正な JSON。
            - 必須フィールド欠け (`I` がない、など)。
            - `mapFromDB` で変換できないデータ。
            - バリデーションエラー（`attribute` が不正な値など）。
        - 混合系: 正常と異常が混在する場合の挙動検証。

### Step 2: 実装 (Implementation)
- **Target**: `app/lib/db/operations.ts`
- **Action**:
    - `importFromJSONL`, `exportAsJSONL` を実装。
    - エクスポートでは `db.cells.orderBy('I').reverse().toArray()` を使用して生データを取得する。
    - インポートでは以下のパイプラインを実装する:
        `raw json -> CellDB object -> Cell object -> Validation -> Save`

### Step 3: 動作検証とリファクタリング (Refine)
- **Action**:
    - `npm test app/lib/db/fileIO.test.ts` を実行し、All Green を確認。
    - 大量データでの簡単なパフォーマンステスト（必要に応じて）。
