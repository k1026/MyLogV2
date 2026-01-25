# アプリ起動速度最適化の実装内容

## 実施日
2026-01-23

## 背景
Androidスマホのブラウザでのアプリ起動時に時間がかかる問題を解決するため、ボトルネックを調査し最適化を実施。

## 発見したボトルネック

### 1. スクリプトの同期ロード（重大）
- **問題**: 16個のJavaScriptファイルが同期的にロードされていた
- **影響**: 白い画面が長時間表示される、ユーザー体験の悪化

### 2. データベース計算の重複処理（重大）
- **問題**: `RarityCalculator`と`TitleEstimator`が同時にDBを全件スキャン
- **影響**: メインスレッドのブロック、起動時間の大幅な増加

### 3. 外部フォントのブロッキング
- **問題**: Google Fontsの読み込みがレンダリングをブロック
- **影響**: First Contentful Paintの遅延

### 4. UI更新の重複
- **問題**: `init()`関数内で`updateUI()`が2回呼ばれていた
- **影響**: 不要な再描画処理

## 実施した最適化

### 1. スクリプトの非同期ロード化
**ファイル**: `index.html`

- すべての`<script>`タグに`defer`属性を追加
- HTMLパース完了後にスクリプトを実行するよう変更
- スクリプトのダウンロードがページレンダリングをブロックしないように改善

```html
<!-- 変更前 -->
<script src="./src/main.js"></script>

<!-- 変更後 -->
<script defer src="./src/main.js"></script>
```

### 2. 初期ローディング画面の追加
**ファイル**: `index.html`

- アプリ起動時に美しいローディング画面を表示
- グラデーション背景とスピナーアニメーション
- 白い画面の代わりにブランドアイデンティティを表現

**ビジュアル要素**:
- ブランドカラーのグラデーション背景
- 「MyLog」ロゴの表示
- 回転するスピナーアニメーション

### 3. フォントの最適化
**ファイル**: `index.html`

- Google Fontsに`&display=swap`パラメータを追加
- フォールバックフォントで先に描画し、カスタムフォントは後から適用
- FOUT (Flash of Unstyled Text) を許容してFOIT (Flash of Invisible Text) を回避

```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;800&display=swap" rel="stylesheet">
```

### 4. 初期化処理の2段階化
**ファイル**: `src/main.js`

**Phase 1: 高速起動**
1. データベースを開く
2. 最小限のUIを描画
3. 初期UIを表示
4. ローディング画面を非表示

**Phase 2: バックグラウンド計算**
1. `requestIdleCallback`を使用して、ブラウザのアイドル時に実行
2. `RarityCalculator`と`TitleEstimator`を並行実行
3. ストレージからキャッシュを読み込み、即座に利用可能に

```javascript
// Phase 1: 最小限の初期化で素早くUIを表示
await updateUI();
hideInitialLoader();

// Phase 2: バックグラウンドでの重い計算処理
requestIdleCallback(() => {
  startBackgroundCalculations();
}, { timeout: 1000 });
```

### 5. DB走査処理の最適化
**ファイル**: `src/services/RarityCalculator.js`

- 100件ごとにメインスレッドに制御を返すバッチ処理を実装
- `setTimeout(..., 0)`を使用してイベントループに制御を戻す
- UIの応答性を維持しながらバックグラウンドで計算を継続

```javascript
const BATCH_SIZE = 100;
if (batchCount >= BATCH_SIZE) {
  batchCount = 0;
  setTimeout(() => {
    cursor.continue();
  }, 0);
}
```

### 6. UI更新の重複削除
**ファイル**: `src/main.js`

- 初期化時の`updateUI()`呼び出しを1回に削減
- バックグラウンド計算完了後に再度`updateUI()`を実行
- 不要な再描画を削減

## 期待される効果

### パフォーマンス改善
- **初期表示時間**: 50-70% 短縮見込み
- **Time to Interactive**: 大幅に改善
- **メインスレッドのブロック時間**: 大幅に削減

### ユーザー体験の向上
- 白い画面の代わりに美しいローディング画面
- アプリがすぐに操作可能に（計算完了前でも）
- スムーズな起動体験

### 技術的な利点
- スクリプトの並列ダウンロード
- Progressive Enhancement の実現
- レスポンシブな UI の維持

## 今後の改善提案

### 1. Service Worker の導入
- オフライン対応
- アセットのキャッシング
- さらなる起動速度の向上

### 2. コード分割
- 初期ロードに不要な機能を遅延ロード
- Dynamic Import の活用

### 3. 画像の最適化
- WebP フォーマットの使用
- 遅延読み込み (lazy loading)

### 4. IndexedDB の最適化
- インデックスの追加
- クエリの最適化
- バッチ書き込みの実装

## 計測方法

### Chrome DevTools での計測
1. **Performance タブ**: ロード時間の詳細分析
2. **Network タブ**: リソースのロード順序と時間
3. **Lighthouse**: 総合的なパフォーマンススコア

### 主要指標
- **FCP (First Contentful Paint)**: 最初のコンテンツ表示時間
- **LCP (Largest Contentful Paint)**: 最大コンテンツ表示時間
- **TTI (Time to Interactive)**: インタラクティブになるまでの時間
- **TBT (Total Blocking Time)**: メインスレッドのブロック時間

## 注意事項

### requestIdleCallback のフォールバック
古いブラウザでは`requestIdleCallback`が利用できない可能性があります。必要に応じてpolyfillの追加を検討してください。

```javascript
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(cb) {
    return setTimeout(cb, 1);
  };
}
```

### デバッグモード
バックグラウンド計算のデバッグには、以下のコードを追加できます：

```javascript
rarityCalculator.calculateFromDatabase((current, total) => {
  console.log(`Progress: ${current}/${total} (${Math.round(current/total*100)}%)`);
});
```
