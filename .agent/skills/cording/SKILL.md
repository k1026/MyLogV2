# Skill: cording (Next.js 16 + Tailwind 4)

## Goal
AIによる解釈性・保守性とトークン効率を最大化し、Next.js 16 / Tailwind 4 環境下で一貫性のある高品質なコードを生成する。

## Rules
### 1. Core Principles (設計原則)
- **Type Safety First:** すべてのデータ構造に型を定義せよ。`any` および `@ts-ignore` は厳禁とする。
- **Context Autonomy:** ファイルは独立性を保ち、ワイルドカードインポート (`import *`) を禁止し、依存関係は明示的にせよ。
- **Token Efficiency:** 不要なコード、コメント、巨大なファイル（200行超）を排除し、AIの読み取り効率を最大化せよ。

### 2. Technical Stack & Rules
- **Next.js (App Router):** - ロジック（DB操作、APIフェッチ等）は Server Component に配置し、インタラクティブな要素のみを `"use client"` で切り出せ。
  - `page.tsx`, `layout.tsx`, `loading.tsx` の役割を厳守し、非ルーティングコンポーネントは `_components/` または `components/` に配置せよ。
- **TypeScript & Schema:**
  - 外部データ（API, DB, Form）は必ず Zod でバリデーションし、型定義は `z.infer` を用いて導出することで SSOT を維持せよ。
  - `import type` を活用し、型と実装の依存関係を明確に分離せよ。
- **Tailwind CSS v4:**
  - 独自CSSは禁止する。クラス名の並び順は「レイアウト → サイズ → 色」を意識せよ。
  - `tailwind.config.js` は使用せず、CSS変数を活用した v4 標準の設定に従え。
- **Database (Dexie.js):**
  - DBスキーマは一箇所で管理し、リポジトリパターン等を用いてアクセスをカプセル化せよ。
  - 非同期操作は `async/await` で記述し、エラーハンドリングを徹底せよ。

### 3. Directory Structure
- `app/`: Routing and Pages
- `components/`: Global Shared Components
- `lib/`: Utilities, DB Clients, and Shared Logic
- `models/`: Zod Schemas and Type Definitions
- `hooks/`: Custom React Hooks

### 4. Constraint for AI
- コード生成時は `eslint.config.mjs` を遵守し、Lintエラー（未使用import等）を絶対に出さないこと。
- 破壊的な変更を行う前には、必ず `grep` 等で影響範囲（参照状況）を確認せよ。