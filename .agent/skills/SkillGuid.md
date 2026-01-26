このドキュメントはユーザーのためのものであり、AIは読み取らなくて良い。

# MyLog Agent Skills: Quick Reference

## スキル一覧 (Skill List)

| スキル名 | 役割 (Role / Summary) | 使用シーン (Usage Scene) |
| :--- | :--- | :--- |
| **@guideline** | プロジェクト全体の構成・実装方針を確認する | 技術スタック、ディレクトリ構造、推奨パターンを確認したい時 |
| **@cording** | Next.js 16 + Tailwind 4 の標準規約に従わせる | コード生成、リファクタリング、新機能の実装時 |
| **@compact** | 挨拶・解説なしでコード差分のみを出力する | 迅速な実装コードのみが必要な時 |
| **@focus** | 最小限のファイル読み込みでピンポイント修正 | バグ修正、特定コンポーネントのみの外科的編集 |
| **@strict** | 型定義とLint/型チェックを徹底する | 複雑なロジック、DB定義変更など堅牢性が求められる時 |
| **@sat-dd** | 仕様定義から変異テストまで一貫して行う | SAT-DD（仕様・AI・テスト駆動開発）プロセスを実行する時 |
| **@tdd** | TDDの4フェーズサイクルを管理する | TDD（first, fix, strict, refine）を一貫して進めたい時 |
| **@template** | 新しいスキルの作成用テンプレート | プロジェクト固有の新しいスキルを追加したい時 |

### TDD サイクル詳細
| スキル名 | ステップ | 役割 |
| :--- | :--- | :--- |
| **@tdd-first** | Step 1 | 仕様からテストコード（.test.ts）と空実装を生成 |
| **@tdd-fix** | Step 2 | テスト結果を解析し、RedからGreenへ実装 |
| **@tdd-strict** | Step 3 | 実装後の型安全確認とクリーンアップ |
| **@tdd-refine** | Step 3+ | テストの厳格化と検知能力の向上 |
| **@tdd-mutation** | Step 4 | 変異テストによるテストの有効性検証 |

## 🛠️ スキルの作成と拡張 (For Engineers)

新しいスキルを作成する場合は、`.agent/skills/template/` をベースにしてください。

### 必須構成
*   **ディレクトリ**: `.agent/skills/<skill-name>/`
*   **SKILL.md**: スキル本体（必須）。先頭に **YAML Frontmatter** が必要です。

### SKILL.md の標準フォーマット
```yaml
---
name: [スキル名]
description: [スキルの短い説明]
---

# スキル名

## 🎯 目的 (Goal)
...
## 📜 ルールと制約 (Rules & Constraints)
...
## 作業手順 (Workflow)
...
```

### 推奨ディレクトリ構成
```text
.agent/skills/<skill-name>/
├── SKILL.md          # メイン手順（必須）
├── scripts/          # 補助スクリプト
├── examples/         # 実装例
└── resources/        # テンプレート等
```