# Skill: focus (Surgical Exploration)

## Goal
不必要なファイルの読み込みを禁止し、依存関係とServer/Client境界を意識した最小限の読み込みで修正範囲を特定する。

## Rules
1. **Map First:** いきなりファイルを読まず、`ls -R` や `grep` で周辺構造（layout.tsxの有無やコンポーネント階層）を確認せよ。
2. **Narrow Read:** ファイル全体を `cat` せず、`grep -n` で行を特定してから必要なコンテキストのみを部分的に読み込め。
3. **No SED:** `sed` による置換は禁止（JSX/TSXの構造破壊防止）。必ず関数やコンポーネント単位の書き換えとして提案せよ。
4. **Interface Focus:** 実装詳細よりも先に、型定義（interface/type）やエクスポートされたシグネチャを優先して把握せよ。