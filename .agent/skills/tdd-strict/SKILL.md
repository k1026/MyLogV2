
## Skill: tdd-strict (Step 3: Refactor & Cleanup)
- **Goal**: Step 2 での修正箇所を中心に、型安全性の検証と最適化を行う。
- **Rules**:

   0. **コード規約**:
      - `docs/specs/00_CordingRules.md`を参考にコードを書くこと。
   1. **Target Identification**: 
      - 直前の `tdd-fix` で変更されたコード行を正確に特定し、そこをスキャン対象とする。
   2. **Compliance Check**: 
      - 修正箇所に `any` が含まれていないか？
      - `unknown` からのキャストは適切か？
      - Zodスキーマとの型矛盾はないか？
   3. **Optimization**: 
      - コードの可読性や効率を最適化する。
   4. **Conditioned Report**:
      - **問題がある場合**: 「検証の結果、[具体的な問題点] が見つかりました。」と報告し修正案を併せて提示する。
      - 検証に合格するまで Step 3 を完遂しないこと。