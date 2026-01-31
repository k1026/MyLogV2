---
name: guideline
description: アプリケーション実装時に従うべきガイドライン。AIによる解釈性・保守性およびトークン効率（コンテキスト最適化）を最大化することを目的とする。
---

# コア技術スタック
- **Framework**: Next.js 16 (App Router), TypeScript (Strict Mode)
- **UI/Styling**: Tailwind CSS 4
- **Data/State**: Dexie.js, TanStack Query, React Hook Form + Zod
- **Infra/Tool**: PWA, ESLint

## 技術スタック特有のルール
- **Tailwind**: CSS変数推奨 (`tailwind.config.js`非推奨)。Prettierによるクラス自動整列に従う。
- **Dexie.js**: リポジトリパターンでカプセル化。`useLiveQuery`でリアクティブ化。

## グローバル制約
1. **Lint遵守**: `eslint.config.mjs` に従う。
2. **SED禁止**: JSX構造破壊リスクのため使用禁止。
3. **パス明示**: 変更提案時はファイルパスを特定して提示。
4. **Zod**: Mocking時は `unknown` キャストパターンを使用。

## 設計原則 (Core Principles)
- **Type Safety**: 全てのデータ構造に型を定義し`any`/`@ts-ignore` の仕様は禁止。データ検証にはZodを使用し、Single Source of Truthとする。
- **Context Autonomy**: ファイルは独立性を保ち、依存関係は明示的にせよ。ワイルドカードインポート (`import *`) およびバレルファイル (`index.ts` による全エクスポート) は原則禁止。
- **Token Efficiency**: 不要なコード、コメントアウト、装飾ライン、巨大なファイルを排除し、AIの読み取り効率とハルシネーション耐性を最大化せよ。1ファイル 100〜200行を維持し、デッドコードは即時削除すること。

## 推奨ディレクトリ構成
- `app/`: ルーティング、ページ。機能ごとのロジックはコロケーション（`app/**/lib/`）を推奨。
- `components/ui/`: プロジェクト全体で共有する汎用UIコンポーネント（Primitive）。
- `components/`: 特定の機能・ドメインに依存するコンポーネント。
- `lib/`: アプリケーション全体で共有すべきコアロジックや型定義。
- `docs/`: 仕様書・ドキュメント
- `public/`: 静的アセット

## テストと品質保証 (Testing & QA)
- **Scope**: 複雑なロジックを含むユーティリティ(`lib/`)とカスタムHooksには必ず単体テスト(`*.test.ts`)を作成する。
- **Tools**: Vitest を使用。コンポーネントテストよりもロジックの単体テストを優先する。
- **Mocking**: 外部API通信やDB操作は必ずモックし、ネットワーク/環境依存のテストを作らないこと。

## エラーハンドリング (Error Handling)
- **User Feedback**: ユーザー起因のエラー（入力ミス等）は `toast` (Sonner等) で通知し、UI上のフィードバックを行う。
- **System Errors**: 予期せぬシステム例外は `console.error` に詳細を出力し、ユーザーには穏便なメッセージを表示する。
- **Boundary**: ページ単位のクラッシュを防ぐため、Next.jsの `error.tsx` や Error Boundary を適切に配置する。

## 実装のプロセスとドキュメンテーション (Implementation & Documentation)
- **インターフェース先行**: 複雑なロジックは先に関数のシグネチャと JSDoc を定義し、AIが結合を推論可能にする。
- **Why/Context指向のコメント**: 「What」はコードで語り、「Why（設計意図やオフライン対応の理由）」をコメントに残す。
- **JSDocの付与**: エクスポートする関数・型には必ず JSDoc を付与し、AIのためのコンテキストを確保する。
- **AIへの制約**: 破壊的な変更を行う前には、必ず `grep` 等で参照状況（影響範囲）を確認せよ。