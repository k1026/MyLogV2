---
name: guideline
description: Next.js 16 + PWA + Local-First + Tailwind 4 構成におけるアプリケーション実装ガイドライン。AIによる解釈性・保守性およびトークン効率（コンテキスト最適化）を最大化することを目的とします。
---

## 設計原則 (Core Principles)

- **Type Safety First**: すべてのデータ構造に型を定義せよ。`any` および `@ts-ignore` は厳禁とする。
- **Context Autonomy**: ファイルは独立性を保ち、依存関係は明示的にせよ。ワイルドカードインポート (`import *`) およびバレルファイル (`index.ts` による全エクスポート) は原則禁止。
- **Token Efficiency**: 不要なコード、コメント、装飾ライン、巨大なファイルを排除し、AIの読み取り効率とハルシネーション耐性を最大化せよ。1ファイル 100〜200行を目安とする。

## 0. 仕様の厳守と型安全性の絶対視 (Strict Adherence & Type Safety)
- **仕様の正当性**: 実装は `.md` 仕様書を正とする。矛盾がある場合は推測せず必ず確認する。
- **Single Source of Truth (SSOT)**:
  - **データ構造**: Zod Schema を正とする。型定義は `z.infer` で生成し、二重管理を防ぐ。
  - **DBスキーマ**: Dexie.js の定義を正とする。
- **Lint/Format**: `eslint.config.mjs` および Biome/ESLint を遵守せよ。エラーは一切許容しない。
- **Type/Implementation Separation**: `import type` を活用し、型と実装の依存関係を明確に分離せよ。

## 1. ディレクトリ構造と粒度 (Directory Structure & Granularity)
- **推奨ディレクトリ構成**:
  - `app/`: ルーティングと各ページのレイアウト（Application Shell）。
  - `components/`: プロジェクト全体で共有されるコンポーネント。
  - `features/`: 機能単位の関連コンポーネント、フック、型（Feature-Sliced Design）。
  - `lib/`: 特定の責務を持つロジックの集約（例: `lib/db/`）。
    - `index.ts`: 「初期化ロジックのみ（再エクスポートはしない）」
    - `schema.ts`: Zodスキーマ・型定義・データ変換
    - `operations.ts`: CRUD操作・ロジック
    - `*.test.ts`: 同一ディレクトリ内にテストを配置
  - `models/`: Zod スキーマと型定義。
  - `hooks/`: カスタム React フック。
- **分割基準**: 「Server/Client Component の境界」での分割を最優先し、`"use client"` は最小範囲に留める。

## 2. 技術スタック特有のルール (Technical Stack Rules)

- **Tailwind CSS v4**:
  - CSS変数を活用し、`tailwind.config.js` は原則使用しない。
  - クラス名の順序は `prettier-plugin-tailwindcss` による自動整列を正とする。手動での並べ替えは行わない。
  - 複雑なクラスは適切に改行またはコンポーネント化して可読性を維持せよ。
- **Database (Dexie.js)**:
  - DBアクセスはリポジトリパターン等でカプセル化せよ。
  - 非同期操作は `async/await` で記述し、エラーハンドリングを徹底せよ。
  - `useLiveQuery` (Dexie-React) 等のフックを活用し、リアクティブなUIを構築せよ。

## 3. 実装のプロセスとドキュメンテーション (Implementation & Documentation)
- **インターフェース先行**: 複雑なロジックは先に関数のシグネチャと JSDoc を定義し、AIが結合を推論可能にする。
- **Why/Context指向のコメント**: 「What」はコードで語り、「Why（設計意図やオフライン対応の理由）」をコメントに残す。
- **JSDocの付与**: エクスポートする関数・型には必ず JSDoc を付与し、AIのためのコンテキストを確保する。
- **AIへの制約**: 破壊的な変更を行う前には、必ず `grep` 等で参照状況（影響範囲）を確認せよ。
- **デッドコード排除**:
  - 未使用コード、コメントアウト、装飾ラインは即時削除し、AIのハルシネーションを防ぐ。