# プロジェクト・クリーンアップ計画 (2026-02-01)

プロジェクトの調査結果に基づき、以下の修正・整理を提案します。

## 1. ディレクトリ構成と命名の整理
- [ ] **コンポーネントディレクトリの命名統一**: `app/components/` 配下の `card`, `cell`, `ui`, `db-viewer` などのフォルダ名を、他のフォルダ（`CardList`, `Header`）に合わせて PascalCase（`Card`, `Cell`, `UI`, `DbViewer`）に統一。
- [ ] **基盤ディレクトリのルート移動**: ガイドラインおよび標準的な Next.js 構成に合わせ、`app/components` → `components`、`app/lib` → `lib` への移動を検討。それに伴うインポートパスの一括修正。
- [ ] **フック配置の集約**: `app/lib/hooks/` にあるフックを `app/hooks/`（またはルートの `hooks/`）に集約。
- [ ] **ユーティリティの整理**: `app/lib/utils.ts` と `app/lib/utils/` ディレクトリの役割を整理し、一箇所に統合。

## 2. コードのリファクタリングと品質向上
- [ ] **巨大ファイルの分割**: `app/components/card/Card.tsx` (241行) をサブコンポーネント（`CardHeader`, `CardContent` 等）に抽出し、1ファイル100〜200行のルールを遵守。
- [ ] **重複テストの整理**: `useCardList.test.ts` と `useCardList.test.tsx` で内容が重複している箇所を一つのテストファイルに統合し、保守性を向上。
