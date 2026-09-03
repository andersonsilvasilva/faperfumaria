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
    // Servidor customizado para hospedagens que exigem um entry point CommonJS
    // (ver docs/deployment.md) — fora da árvore TS/ESM do app.
    "server.js",
  ]),
]);

export default eslintConfig;
