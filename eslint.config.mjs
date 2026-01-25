import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {

      // =================================================================
      // 指針 0.0: 型安全性の絶対視 (Type Safety)
      // AIによる「とりあえずany」や「@ts-ignore」を許さない
      // =================================================================
      "@typescript-eslint/no-explicit-any": "error", // any型は絶対禁止
      "@typescript-eslint/ban-ts-comment": "error", // @ts-ignore 禁止

      // 型定義のimportを分離（import type ...）。
      // コンパイル後のコードから消えるため、AIが「ロジック依存」と「型依存」を区別しやすくなる
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],

      // =================================================================
      // 指針 0.1: 構造化と粒度 (Semantic Granularity)
      // ファイルの肥大化を防ぎ、RAGの検索精度を高める
      // =================================================================
      // 1ファイル200行制限（これを超えるとAIがファイルを分割しようとする）
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      // 1関数50行制限（ロジックの小分け化強制）
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      // コールバック地獄の防止
      "max-nested-callbacks": ["error", 3],

      // =================================================================
      // 指針 0.2: 独立性と自己完結性 (Context Autonomy)
      // ワイルドカードインポートの禁止、循環参照の禁止
      // =================================================================
      // import * as X の禁止（何に依存しているかAIが追えなくなるため）
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportNamespaceSpecifier",
          message: "ワイルドカードインポート (import * as) は禁止です。必要なモジュールを個別にimportしてください。",
        },
      ],
      // 循環参照の禁止（AIの推論ループ防止）
      "import/no-cycle": "error",
      // デフォルトエクスポートより名前付きエクスポートを推奨（リファクタリング耐性）
      "import/no-default-export": "warn",


      // =================================================================
      // 指針 0.3: 実装の分離 & Tailwind (UI/Logic Separation)
      // Tailwind CSS v4 対応のため設定を調整
      // =================================================================

      // v4では動的なクラス生成やCSS設定が増えるため、誤検知防止でOFFにする
      "tailwindcss/no-custom-classname": "off",

      // クラスの並び順だけは強制する（可読性維持のため）
      "tailwindcss/classnames-order": "warn",

      // =================================================================
      // 指針 0.4: トークン効率の最大化 (Token Density)
      // 死にコード、未使用インポート、console.logを徹底的に排除する
      // =================================================================
      "no-console": ["error", { allow: ["warn", "error"] }], // デバッグ用logの残留禁止
      "no-unused-vars": "off", // TS側で制御するためOFF
      "@typescript-eslint/no-unused-vars": ["error"], // 使っていない変数はエラー
      "unused-imports/no-unused-imports": "error", // 使っていないimportは自動削除対象

    },
  },
  // Next.jsのページコンポーネントのみ default export を許可する例外設定
  {
    files: ["app/**/{page,layout,loading,error,not-found}.tsx"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];

export default eslintConfig;