# ヘッダーUI 実装計画

## 1. 要件定義・仕様確認
`docs/specs/11_Header.md` に基づき、ナビゲーションおよびステータス表示を行うヘッダー機能を実装する。

### 主な機能要件
*   **デザイン**: ライトテーマ、Glassmorphism (背景ぼかし)、勾配テキスト、画面上部固定 (`z-40`以上)。
*   **タイトルエリア**:
    *   `MyLog` ロゴ (Deep Purple)。
    *   DB読み込み進捗を表すアニメーション (ロゴの `clip-path` 制御)。
    *   バージョン番号 (`v2.0.0` 等)。
    *   クリックアクション: アプリ状態リセット (フィルタ解除・トップへスクロール)。
*   **ステータスエリア**:
    *   **位置情報**: 取得状態 (`active`, `inactive`, `error`, `loading`) の可視化とトグル。
    *   **カードカウント**: `表示数 / 総数` の形式で表示。
*   **アクションエリア**:
    *   **ランダムピック**: 表示中のカードから1つをランダムに選択してフォーカス。
    *   **DBステータス**: `DbViewer` の開閉、バックグラウンド処理中のインジケータ表示。
*   **動的表示制御 (UX)**:
    *   **スクロール監視**: 下方向スクロールで隠し、上方向で表示。
    *   **フォーカス監視**: 入力要素 (`input`, `textarea`) フォーカス時は隠す。

## 2. アーキテクチャ設計

### ファイル構成
```
app/
  components/
    Header/
      Header.tsx        // メインコンポーネント (Logic & Layout)
      HeaderTitle.tsx   // タイトル・進捗ロゴ
      HeaderStatus.tsx  // 位置情報・カウント
      HeaderActions.tsx // アクションボタン
      index.ts          // export用
  contexts/
    LocationContext.tsx // [新規] 位置情報管理
```

### ステート管理方針
1.  **位置情報 (`LocationContext`)**:
    *   仕様に「取得中/アクティブ/非アクティブ/エラー」の区別があるため、専用コンテキストで管理する。
    *   API: `status` (state), `toggleLocation` (function)。
2.  **ヘッダー表示 (`Header.tsx` 内)**:
    *   `isVisible`: スクロール量と方向、フォーカス状態から算出。
    *   カスタムフック `useHeaderVisibility` を作成しロジックを分離しても良い。
3.  **データ連携 (`props`経由)**:
    *   `Header` は `page.tsx` から `cards` (カウント用), `onDbOpen`, `onReset` 等を受け取る。

## 3. 実装ステップ

### Step 1: LocationContext の実装
*   **Context作成**: `app/contexts/LocationContext.tsx`
    *   State: `status` ('idle', 'loading', 'active', 'error')
    *   Action: `toggle()` - 仮実装でステータスを遷移させる機能のみでも可（実Geolocation API実装は後回しでもよいが、可能なら実装する）。
*   **Provider配置**: `app/layout.tsx` または `app/page.tsx` でラップ。

### Step 2: Header コンポーネント (UI) 実装
*   **コンポーネント作成**: `Header` およびサブコンポーネントを作成する。
*   **スタイリング (Tailwind)**:
    *   `backdrop-blur`, `bg-white/70`, `sticky`, `top-0` 等を使用。
    *   タイトルロゴの `clip-path` アニメーション用CSS/Style実装。
*   **基本動作**:
    *   Props 受け渡し (`onReset`, `onRandomPick`, `onDbOpen` 等) の定義。

### Step 3: 動的表示制御 (Visibility Logic)
*   **イベントリスナー**:
    *   `window.onscroll`: 前回の `scrollY` と比較し `direction` を判定。
    *   `focusin` / `focusout`: イベントターゲットのタグ名を確認 (`INPUT`, `TEXTAREA`)。
*   **アニメーション**:
    *   `transform: translateY(-100%)` 等での隠蔽制御。

### Step 4: Pageへの統合
*   **修正対象**: `app/page.tsx`
*   **作業**:
    *   既存の `<header>` ブロックを `<Header />` コンポーネントに置換。
    *   必要なProps (`cards.length`, `totalCount`, `isDbViewerOpen` setter 等) を渡す。
    *   「ランダムピック」ロジックの簡易実装 (例: `cards`配列からランダムにIDを選び、`document.getElementById` でスクロール)。

## 4. 検証・テスト計画
*   **目視確認**:
    *   画面遷移時のヘッダー表示。
    *   スクロール時の隠蔽・再表示動作。
    *   入力フォームフォーカス時の隠蔽動作。
    *   各ボタンのクリックフィードバック。
*   **自動テスト**:
    *   `Header.test.tsx` (表示テスト)。
    *   `isVisible` ロジックの単体テスト (余裕があれば)。
