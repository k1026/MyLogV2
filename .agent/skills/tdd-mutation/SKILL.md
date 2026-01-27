---
name: tdd-mutation
description: ミューテーションテストのためのバグ注入と検証を行いテストの品質を担保する。
---

## 目的 (Goal)
意図的なバグ（Mutant：変異体）を混入させた実装コードのコピーを作成し、テストがそのバグを検出できるか検証することで、テストの品質を担保する。

## ルールと制約 (Rules & Constraints)
- このスキルは Windows OS かつ Typescript環境でのみ実行します。他の環境では実行せずにスキップしてください。

### Step 1: Preparation (準備・バックアップ):
`.agent/skills/tdd-mutation/scripts/mutation-inject.js`を使用してテスト対象となる実装コードファイルのバックアップを確保します。

下記に`mutation-inject.js`の起動例を示します。<target_file_path>が対象の実装コード、<mutant_source_path>が変異体を注入するコードのファイルパスです。

> ### Syntax
> node .agent/skills/tdd-mutation/scripts/mutation-inject.js <target_file_path> <mutant_source_path>
> ### Example
> node .agent/skills/tdd-mutation/scripts/mutation-inject.js src/utils/calculate.ts temp/buggy_calculate.ts

### Step 2: Mutant Injection (変異体注入):
システムの健全性とテスト強度を測るため、以下のどちらかのCaseで変異体を注入します。
**Case A: コントロール (バグ 0個)**
* 論理変更を行わない（またはオリジナルと同じ）コードを注入する。
* 目的: 注入スクリプトや `NODE_ENV` 判定自体がエラーを引き起こさないかの確認。

**Case B: ミュータント (バグ 1個)**
* コードファイルのロジックを反転・破壊してバグを**1つだけ**注入する。
* 引き起こすエラーは実装に併せて適切なものを選ぶこと。
* 注入するバグは下記のような論理的なものを中心に選ぶこと。
    > - 境界値のズレ (> を >= に変える、 +1 を消す)
    > - 条件反転 (if (isValid) を if (!isValid) に変える)
    > - ガード節の削除 (エラーチェックの if (error) return; を消す)
    > - 固定値リターン (計算結果を常に 0 や null で返す)
    > - セキュリティ/認証回避 (権限チェックを true に固定する)

### Step 3: Verification (検証実行):
 `npm run test:ai`を実行し、`test-results.log`の内容を確認する。下記のように注入したバグ数に応じて合格基準が異なります。

* **バグ 0個 (Case A) の場合:**
    * ✅ **合格:** 全てのテストが **成功 (PASS)** すること。
    * ❌ **不合格:** テストが失敗した場合、注入プロセス自体に問題が存在します。その場合は Step 4 を実行し状態を復元したあとプロセスを中断しユーザーに問題を報告してください。

* **バグ 1個 (Case B) の場合:**
    * ✅ **合格:** バグ注入箇所に該当するテストが **失敗 (FAIL)** し、エラー内容が意図したバグと一致していること。かつ、無関係なテストはパスしていること。
    * ❌ **不合格:** テストが全て成功してしまった場合（バグを見逃した）、テストケース不足と判断する。

### Step 4: Restoration (完全復元):
検証の合否に関わらず、`.agent/skills/tdd-mutation/scripts/mutation-restore.js`を用いて変異体コードを削除し、バックアップファイルから実装コードを即座に正常な状態へ書き戻します。

下記に`mutation-restore.js`の起動例を示します。<target_file_path>が対象の実装コードのバックアップファイルのパスです。

> ### Syntax
> node .agent/skills/tdd-mutation/scripts/mutation-restore.js <target_file_path>
> ### Example
> node .agent/skills/tdd-mutation/scripts/mutation-restore.js src/utils/calculate.ts

### Step 5: Safety Sweep (安全走査):
正しく復元されたかを確認するため、`.agent/skills/tdd-mutation/scripts/mutation-guard.js`を実行しプロジェクトをスキャンします。
マーカーの残留が検出された場合、エラーを報告し、手動確認を要求する。

下記に`mutation-guard.js`の仕様例を示します。<target_file_path>はテストした実装コードのパスで、そのファイルが配置されたフォルダ内に変異体コードが残っていないかを確認します。

> ### Syntax
> node .agent/skills/tdd-mutation/scripts/mutation-guard.js <target_file_path>
> ### Example
> node .agent/skills/tdd-mutation/scripts/mutation-guard.js src/utils/calculate.ts

【重要】スクリプトを実行して `CRITICAL FAILURE`や`Mutant marker detected`や`FAILED:`などが出力された場合はファイルの復元に失敗したと判断し、直ちにプロセスを中断しユーザーに状況と問題を報告してください。

