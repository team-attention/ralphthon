import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Ban 'use server' directive outside admin Route Handlers.
      // CI also enforces this via grep, but this catches it at lint time.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement > Literal[value='use server']",
          message:
            "'use server' is banned. Participant code must use Supabase Client SDK + RLS only. Admin operations go in src/app/api/admin/ Route Handlers.",
        },
      ],
    },
  },
]);

export default eslintConfig;
