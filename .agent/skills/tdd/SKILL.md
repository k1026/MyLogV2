---
name: tdd
description: TDDサイクル（tdd-first, tdd-fix, tdd-strict, tdd-refine）を管理し、堅牢なソフトウェア開発フローを完遂する。
---

# TDDサイクル管理 (TDD Manager)


## 目的 (Goal)
`tdd-first`、`tdd-fix`、`tdd-strict`、`tdd-refine`の4つのスキルサイクルを回し、堅牢なソフトウェア開発フローを完遂する。

## ルールと制約 (Rules & Constraints)
- 実装は`.agent/skills/gidline/SKILL.md`に従うこと。
- 実装後の成果物の報告は日本語で行うこと。
- **【重要】**：同じStepを3回繰り返すたびにユーザーに継続するか確認を求めること。

## 作業手順 (Workflow)

### Step 0：フェーズ判定
- 新規機能の実装、または既存機能の外部から見た振る舞いが変わる修正の場合は **Step 1** へ進む。
- 振る舞いを変えない内部最適化・リファクタリングの場合は **Step 2** へ進む。

### Step 1: Test-First (tdd-first)
- `.agent/skills/tdd-first/SKILL.md`を実行し仕様書を元に、実装に必要なテストと空のシグネチャを作成する。
- テストコマンド`npm run test:ai` を実行し、対象のテストが全て論理的にエラー（Red）になるまで`.agent/skills/tdd-first/SKILL.md`によるテスト実装を繰り返す。
- 全てのテストが論理的にエラー(Red)になったら**Step2**に進む。

### Step 2: Implementation (tdd-fix)
- `.agent/skills/tdd-fix/SKILL.md`を実行し、全てのテストをパス（Green）させるための最短の実装を行う。
- `npm run test:ai` を実行し全てのテストをパスするまで`.agent/skills/tdd-fix/SKILL.md`を繰り返す。

### Step 3: Optimization & Hardening (tdd-strict, tdd-refine)
- `.agent/skills/tdd-strict/SKILL.md`を実行し、**Step2**で変更されたコードを検証し、コードのを最適化する。
- コードの最適化後、`.agent/skills/tdd-refine/SKILL.md`を実行してテストケースを厳格化する。
- 再度`npm run test:ai` を実行し、全てのテストにパスするまで **Step 3** の最初から繰り返し品質を高める。
- **Step 3** で全てのテストをパスしたら**Step 4**に進む。

### Step 4: Completion
- 実装結果を日本語でまとめてユーザーに完了を報告する。
