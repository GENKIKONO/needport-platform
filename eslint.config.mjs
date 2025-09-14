import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // 安全ガード: 未定義配列参照を検出
      'no-unsafe-optional-chaining': 'error',
      // 禁止: 絵文字の使用
      'no-irregular-whitespace': ['error', { skipStrings: false }],
      // 禁止: "サービスの流れ/船"周辺にLinkを追加
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement[openingElement.name.name="Link"]',
          message: 'FlowStrip周辺にはLinkを追加しないでください（アニメのみ）'
        }
      ],
      // 禁止: body背景の変更
      'no-restricted-properties': [
        'error',
        {
          object: 'className',
          property: 'bg-*',
          message: 'body背景は変更しないでください'
        }
      ],
      // 禁止: 旧ヘッダーの直接使用 + 環境変数とSupabaseクライアントの直接使用
      'no-restricted-imports': ['error', {
        paths: [
          { name: "@/components/Header", message: "ヘッダーは AppHeader を使用してください。" },
          { name: "@/components/layout/Header", message: "ヘッダーは AppHeader を使用してください。" },
          { name: "@/mkt/components/MktHeader", message: "ヘッダーは AppHeader を使用してください。" },
          { name: "@supabase/supabase-js", message: "Supabase クライアントは /src/lib/supabase/ 経由で作成してください。" }
        ],
        patterns: [
          {
            group: ["**/supabase-js"],
            message: "Supabase クライアントは /src/lib/supabase/ 経由で作成してください。"
          }
        ]
      }],
      // 禁止: process.env の直接使用（config モジュール外）
      'no-restricted-globals': [
        'error',
        {
          name: 'process',
          message: '環境変数は /src/lib/config/ モジュール経由でアクセスしてください。直接 process.env.* を使用しないでください。'
        }
      ]
    }
  }
];
