import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          "selector": "MemberExpression[object.name='process'][property.name='env'] Property[value='SUPABASE_SERVICE_ROLE_KEY']",
          "message": "service role key はクライアントで参照禁止。server/admin 経由にしてください。"
        }
      ]
    },
    overrides: [
      {
        files: ["**/*.{ts,tsx}"],
        excludedFiles: ["src/lib/supabase/admin.ts", "src/app/api/**/*", "src/app/**/route.ts", "scripts/**/*"]
      }
    ]
  }
];
