# 実装計画: セルタイトル推定機能

## 概要
ユーザーの入力補助機能として、直近の履歴・時刻・場所のコンテキストから次に作成されるセルのタイトルを推定する機能を実装する。
`docs/specs/10_CellTitleEstimation.md` に基づき、重み付け投票アルゴリズムを採用する。

## 分析結果
- **実装可能性**: 高い。依存関係は既存の `LocationService` と `CellRepository` のみ。
- **難易度**: 中。ロジック自体は単純だが、データ構造の管理（特にLocalStorageとDBの同期、プルーニング）に注意が必要。
- **懸念点**:
  - メインスレッドでの計算負荷: 10ms以内という制約があるため、データ量が肥大化した際の検証が必要。
  - 「直近10個」の定義: 仕様変更により「DB上の直近10件（Card, Timeを除く）」と明確化されたため、UI状態ではなくDBクエリを利用する。

## 実装手順

### 1. 型定義とユーティリティの実装
- **ファイル**: `app/lib/services/estimation/types.ts`, `app/lib/services/estimation/utils.ts`
- **内容**:
    - `TransitionMap`, `TimeMap`, `LocationMap` の型定義。
    - 緯度経度の丸め処理 (`getGeoKey`)、時刻のバケット化 (`getTimeSlot`) などのヘルパー関数。

### 1.5 DBアクセサの拡張
- **ファイル**: `app/lib/db/operations.ts`
- **内容**:
    - `getRecentCells(limit: number, excludeAttributes: CellAttribute[])`: 直近のセルを取得するメソッドを追加。
    - コンテキスト生成時（推定直前）にこれを呼び出して履歴情報を取得する。

### 2. 推定サービス（Core Logic）の実装
- **ファイル**: `app/lib/services/estimation/CellTitleEstimationService.ts`
- **内容**:
    - クラス `CellTitleEstimationService` の定義。
    - `LocalStorage` への保存・読み込み (`load`, `save`)。
    - 学習ロジック (`learn(cells: Cell[])`): マップの更新処理。
    - 推定ロジック (`estimate(context)`): スコア計算とランキング。
    - 枝刈りロジック (`prune`): メモリ制約(1MB)を守るためのデータ削除。

### 3. DB同期機能の実装
- **ファイル**: `app/lib/services/estimation/CellTitleEstimationService.ts` (追記)
- **内容**:
    - `syncWithDB()` メソッドの実装。
    - `CellRepository` から直近3000件を取得し、`learn` を実行して学習データを初期化・更新する。
    - 非同期で実行し、UIをブロックしないようにする。

### 4. サービスの単体テスト
- **ファイル**: `app/lib/services/estimation/CellTitleEstimationService.test.ts`
- **内容**:
    - 各スコア（Sequence, Time, Location）が正しく加算されるか検証。
    - 学習データの更新と永続化のテスト。
    - 枝刈りが正しく機能するかのテスト。

### 5. React Hookの実装
- **ファイル**: `app/lib/hooks/useCellTitleEstimation.ts`
- **内容**:
    - `useCellTitleEstimation` フック。
    - `useCellTitleEstimation` フック。
    - `estimate` 実行前に `CellRepository.getRecentCells(10, ['Card', 'Time'])` を呼び出してコンテキスト(履歴)を構築するロジックを実装。
    - アプリ起動時の初期化(`syncWithDB`)をトリガーする `useEstimationInit` も検討。

### 6. UIへの統合 (Card/Cell)
- **ファイル**: `app/components/card/Card.tsx` (または `CellContainer` 等)
- **内容**:
    - セル追加時やタイトル入力開始時にフックを使用して候補を取得。
    - 取得した候補をUI（入力補完リスト等）に表示する（UI仕様の詳細は別途調整が必要だが、まずはConsole出力またはシンプルなリストで検証）。
    - セル保存時に `service.learn([newCell])` を呼び出し、学習データをリアルタイム更新する。

### 7. 初期化処理の統合
- **ファイル**: `app/page.tsx`
- **内容**:
    - アプリケーション起動時（初回マウント時）にサービスを初期化し、DB同期を実行する。

## 検証項目
- 推定結果がコンテキスト（時間、場所、履歴）によって変化すること。
- DBから過去データをロードして学習済み状態になること。
- LocalStorage にデータが保存されていること。
- 推定処理が高速（体感できる遅延がない）であること。
