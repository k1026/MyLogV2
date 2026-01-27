---
name: tdd-fix
description: テストをパスさせるための最小限の実装を行う（Red-to-Green）。
---

# TDD実装 (TDD Step 2: Red-to-Green)

テストをパスさせるための最小限の実装を行います。

## 目的 (Goal)
テストをパスさせるための最小限の実装を行う。

## ルールと制約 (Rules & Constraints)
1. プロジェクトルートの `test-results.log` を読み取り、エラーの原因（失敗したテスト名とエラー内容）を特定する。
2. `any` を一切使わず、Strictな型を維持したまま、テストをパスさせるためのコード実装・修正をファイル(.ts)に記述する。

    
