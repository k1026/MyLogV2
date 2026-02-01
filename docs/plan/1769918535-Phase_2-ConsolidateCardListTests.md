---
description: useCardListのテストファイルを一つに統合し保守性を向上させる。
---

# 関連仕様書
- なし (内部リファクタリング)

# Phase 2: テストコードの整理

## Step 1: useCardList.test.ts への移植
- `hooks/useCardList.test.tsx` に記述されている `should allow updating a card in the list` のテストケースをコピーする。
- `hooks/useCardList.test.ts` に貼り付け、依存関係（Cell, CellAttribute等）を調整する。

## Step 2: useCardList.test.tsx の削除
- 空になった（または移行済みの） `hooks/useCardList.test.tsx` を削除する。

## Step 3: 動作確認 (任意)
- テストを実行し、全てのケースがパスすることを確認する。
