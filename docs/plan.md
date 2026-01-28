# 位置情報取得機能 (Location Service) 実装計画

## 1. 要件定義・仕様確認
`docs/specs/14_LocationService.md` に基づき、アプリ全体での位置情報管理機能と、Cell生成時の位置情報記録機能を実装する。

### 機能要件
1.  **位置情報の常時監視**: `navigator.geolocation.watchPosition` を使用して位置情報をリアルタイムに追跡する。
2.  **ステータス管理**: 位置情報の取得状態（ローディング、アクティブ、エラー、無効）を管理し、UI（Header等）に提供できる状態にする。
3.  **Cell記録**: 新しいCell（Card, Time, Text, Task）が作成される際、その瞬間の位置情報（緯度、経度、高度）を `geo` 属性に記録する。

## 2. アーキテクチャ設計

### ファイル構成
```
app/
  contexts/
    LocationContext.tsx // [新規] 位置情報の監視と状態提供
  components/
    card/
      cardUtils.ts      // [修正] 位置情報を受け取るように変更
      CardFAB.tsx       // [修正] Contextから位置情報を取得しUtilsへ渡す
  page.tsx              // [修正] Contextから位置情報を取得しUtilsへ渡す
```

### データフロー
1.  **LocationContext**: アプリ起動時（Providerマウント時）に `watchPosition` を開始。最新の `Coordinates` と `Status` を保持する。
2.  **Component (Page, CardFAB)**: `useLocation` フックを使用して `LocationContext` から現在の位置情報データを取得する。
3.  **Utils (cardUtils.ts)**: Componentから渡された位置情報データ（文字列形式 `lat lng alt` または `null`）を使用して、Cell生成時に `geo` フィールドを設定する。

### 技術的制約・決定事項
*   **位置情報フォーマット**: データベース（Dexie）の仕様およびモデル定義に従い、`"lat lng alt"` のスペース区切り文字列とする。高度が取得できない場合はそこをどうするかだが、JSの `Coordinates.altitude` は `null` の場合がある。仕様では「3つの値を記録」とあるが、nullの場合はどうするか？ -> `null` なら記録しないか、あるいは `0` などの代替値を入れるか、`lat lng` だけにするか。
    *   **決定**: `altitude` が `null` の場合は `0` として記録する。これにより常に3つの値（`lat lng alt`）がスペース区切りで記録されることを保証し、パース時の処理を簡潔にする。
    *   仕様の実例: `"35.6895 139.6917 10.5"` (高度不明時は `"35.6895 139.6917 0"`)
*   **非同期処理**: `watchPosition` はコールバックベースだが、React State に反映させることでリアクティブにする。

## 3. 実装ステップ

### Step 1: LocationContext の実装
*   **ファイル**: `app/contexts/LocationContext.tsx`
*   **内容**:
    *   `LocationContextType` 定義:
        *   `location`: `{ latitude: number, longitude: number, altitude: number | null } | null`
        *   `geoString`: `string | null` (整形済みの文字列 `lat lng alt` 便宜上用意すると便利)
        *   `status`: `'loading' | 'active' | 'error' | 'disabled'`
        *   `error`: `string | null`
    *   `LocationProvider`: `navigator.geolocation.watchPosition` を実装。
        *   Options: `{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }`
    *   `useLocation` フックのエクスポート。

### Step 2: cardUtils.ts の修正
*   **ファイル**: `app/components/card/cardUtils.ts`
*   **内容**:
    *   `createCard(geo: string | null): Promise<Cell>` に変更。
    *   `addCellToCard(cardId: string, attribute: CellAttribute, currentIds: string[], geo: string | null): Promise<Cell>` に変更。
    *   内部で `Cell` オブジェクト生成時に `geo` プロパティに引数の値をセットするように修正。
    *   `createCard` 内で生成される子セル (Time, Text) にも同様に `geo` をセットする。

### Step 3: コンポーネントの修正 (連動)
*   **ファイル**: `app/components/card/CardFAB.tsx`
    *   `useLocation` をインポート。
    *   `handleAdd` 内で `addCellToCard` を呼ぶ際に `location.geoString` を渡す。
*   **ファイル**: `app/page.tsx` (または `app/components/CardList.tsx` 等、Card生成を行っている場所)
    *   `useLocation` をインポート。
    *   Card生成呼び出し (`createCard`) 時に `location.geoString` を渡す。

### Step 4: ルートへのProvider配置
*   **ファイル**: `app/layout.tsx`
    *   `LocationProvider` でアプリ全体 (`children`) をラップする。

## 4. 検証・テスト計画

### 自動テスト (Vitest)
*   **Unit Test**: `cardUtils.test.ts` (もしあれば、なければ作成推奨)
    *   `createCard` や `addCellToCard` が `geo` 引数を正しく反映するかテスト。
*   **Component Test**:
    *   `navigator.geolocation` はブラウザAPIなので、Vitest環境ではモックが必要。
    *   `vi.stubGlobal('navigator', { geolocation: { ... } })` 等を使用して位置情報取得をシミュレートし、生成されたCellに `geo` が含まれているか検証する。

### 動作確認
*   ブラウザの開発者ツールで「Sensors」タブを開き、GeolocationをOverrideして動作確認する。
    *   東京、ロンドンなどで座標を変えてCellを作成し、IndexedDB (Applicationタブ) で `geo` カラムが正しく保存されているか確認。
    *   `Location blocked` などのエラー状態で `null` が保存されるか確認。
