# Cell位置情報記録のCellクラス内包化計画

## 概要
現在、Reactコンポーネント(`LocationContext`)から手動で渡されている位置情報(`geoString`)を、`Cell`クラスのインスタンス生成時に自動的に解決・記録するようにリファクタリングします。これにより、UI層がデータ記録の詳細に関与せず、`Cell`の生成ロジックがより堅牢になります。

## 前提条件
- `docs/specs/14_LocationService.md` の記述「この記録は Cell クラスのコンストラクタ内で自動的に行われます」に実装を準拠させます。
- `Cell`クラス自体はPureなTypeScriptクラスとして保持し、Reactフック(`useLocation`)には依存しません。

## 実装計画

### Step 1: LocationServiceの作成 (インフラ整備)
Reactの外側から同期的に「現在位置」にアクセスするためのシングルトンサービスを作成します。
- **作成ファイル**: `app/lib/services/LocationService.ts`
- **機能**:
  - `currentGeo`: 現在のフォーマット済み位置情報文字列を保持
  - `updateLocation(lat, lng, alt)`: 位置情報を更新
  - `getCurrentGeoString()`: 現在値を返す
- **統合**: `app/contexts/LocationContext.tsx` 内で `watchPosition` の更新に合わせて `LocationService` を更新するように修正します。

### Step 2: Cellクラスの修正
`Cell`クラスのコンストラクタで、位置情報が明示的に渡されなかった場合に `LocationService` から自動取得するように変更します。
- **対象ファイル**: `app/lib/models/cell.ts`
- **変更点**:
  - コンストラクタの引数型を調整し、`geo` を省略可能(`undefined`)にします。
  - `geo` が `undefined` の場合、`LocationService.getCurrentGeoString()` を使用して初期化します。
  - `geo` が `null` (DBからの復元でデータなし) の場合は、`null` を維持します。
  - `createCellId` は変更しませんが、`Cell`作成フローの一部として機能的に統合されます。

### Step 3: 生成ユーティリティのリファクタリング
`cardUtils.ts` での手動での位置情報受け渡しを廃止します。
- **対象ファイル**: `app/components/card/cardUtils.ts`
- **変更点**:
  - `createCard`, `addCellToCard` 関数から `geo` 引数を削除します。
  - `new Cell(...)` 呼び出し時に `geo` プロパティを渡さないように変更し、クラス内自動解決に委ねます。

### Step 4: UIコンポーネントのクリーンアップ
不要になった位置情報の受け渡しロジックをUIコンポーネントから削除します。
- **対象ファイル**:
  - `app/page.tsx`: `createCard` 呼び出し時の引数削除。
  - `app/components/card/Card.tsx`: `addCellToCard` 呼び出し時の引数削除。
- **確認**: `useLocation` フックが「表示」以外の目的（データ記録用）で使われていないか確認し、余分な依存を削除します。

### Step 5: テストの更新と動作確認
- **対象ファイル**:
  - `app/lib/models/cell.test.ts`: `geo`未指定時の自動解決のテストを追加。
  - `app/components/card/cardUtils.test.ts`: 引数変更に伴う修正。
- **検証**:
  - アプリを起動し、カード作成・セル追加時に位置情報が正しく記録されるか確認。 db-viewer等で値を確認。

## 補足
- 既存のDBデータ(`geo: null`)は、読み込み時にそのまま `null` として扱われるため、過去のデータが勝手に現在位置で上書きされることはありません。
