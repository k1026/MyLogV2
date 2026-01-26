## Skill: tdd (TDD Manager)
- **Goal**: `tdd-first`、`tdd-fix`、`tdd-strict`、`tdd-refine`の4つのスキルサイクルを回し、堅牢なソフトウェア開発フローを完遂する。
- **Rules**:

    0. **Step 0：フェーズ判定**: 
        - `npm run test:ai` を実行する際は、ユーザーの承認を待たずにターミナルで即座に実行し、その結果を報告せよ。ただし、それ以外の `npm install` やファイル削除などの操作は通常通り承認を求めること。
        - **【重要】**：同じステップを3回繰り返すたびにユーザーに継続するか確認を求めること。
        - 新規機能の実装、または既存機能の外部から見た振る舞いが変わる修正の場合は **Step 1** へ進む。
        - 振る舞いを変えない内部最適化・リファクタリングの場合は **Step 2** へ進む。
    1. **Step 1: Test-First (tdd-first)**: 
        - `.agent/skills/tdd-first/SKILL.md`を実行し仕様書を元に、実装に必要なテストと空のシグネチャを作成する。
        - テストコマンド`npm run test:ai` を実行し、対象のテストが全て論理的にエラー（Red）になるまで`.agent/skills/tdd-first/SKILL.md`によるテスト実装を繰り返す。
        - 全てのテストが論理的にエラー(Red)になったら**Step2**に進む。
    2. **Step 2: Implementation (tdd-fix)**: 
        - `.agent/skills/tdd-fix/SKILL.md`を実行し、全てのテストをパス（Green）させるための最短の実装を行う。
        - `npm run test:ai` を実行し全てのテストをパスするまで`.agent/skills/tdd-fix/SKILL.md`を繰り返す。
    3. **Step 3: Optimization & Hardening (tdd-strict, tdd-refine)**: 
        - `.agent/skills/tdd-strict/SKILL.md`を実行し、**Step2**で変更されたコードを検証し、コードのを最適化する。
        - コードの最適化後、`.agent/skills/tdd-refine/SKILL.md`を実行してテストケースを厳格化する。
        - 再度`npm run test:ai` を実行し、全てのテストにパスするまで **Step 3** の最初から繰り返し品質を高める。
        - **Step 3** で全てのテストをパスしたら**Step 4**に進む。
    4. **Step 4: Completion**: 
        - 要約をまとめてユーザーに完了を報告する。