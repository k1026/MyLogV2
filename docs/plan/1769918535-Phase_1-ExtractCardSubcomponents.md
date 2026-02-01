---
description: CardコンポーネントをCardHeaderとCardContentに分割し、Card.tsxの肥大化を解消する。
---

# 関連仕様書
- `docs/specs/05_CardUI.md`

# Phase 1: Cardコンポーネントの分割

## Step 1: CardHeaderコンポーネントの作成
- `components/Card/CardHeader.tsx` を作成する。
- `Card.tsx` からヘッダー部分（通常時のタイトル/日付表示、展開時のツールバー/閉じるボタン）の型定義とコンポーネントを抽出する。
- 必要なProps: `isExpanded`, `isRemoved`, `viewMode`, `sortState`, `displayTitle`, `highlightKeywords`, `formattedDate`, `handleToggle` 等。

## Step 2: CardContentコンポーネントの作成
- `components/Card/CardContent.tsx` を作成する。
- `Card.tsx` から展開時のコンテンツ部分（FAB、セルリスト、CellContainerのループ）を抽出する。
- 必要なProps: `footerVisible`, `handleAddCell`, `cellModels`, `handleCellSave`, `lastAddedId` 等。

## Step 3: Card.tsxの修正
- `Card.tsx` で `CardHeader` と `CardContent` をインポートする。
- `Card.tsx` 内の冗長なJSXを削除し、抽出したコンポーネントに置き換える。
- 状態管理やロジック（useLiveQuery, rarity計算等）は `Card.tsx` に残し、各コンポーネントに props で分配する。
