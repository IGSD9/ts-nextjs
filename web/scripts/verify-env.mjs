#!/usr/bin/env node
/**
 * デプロイ前チェック: 必須環境変数が設定されているか（値は表示しない）
 * 使い方: node scripts/verify-env.mjs
 */

const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const placeholders = ["USER:PASSWORD", "YOUR_PROJECT_REF", "YOUR_ANON_KEY"];

let failed = false;

for (const key of required) {
  const value = process.env[key]?.trim() ?? "";
  if (!value) {
    console.error(`[NG] ${key} が未設定です`);
    failed = true;
    continue;
  }
  if (placeholders.some((p) => value.includes(p))) {
    console.error(`[NG] ${key} がプレースホルダのままです`);
    failed = true;
    continue;
  }
  console.log(`[OK] ${key}`);
}

if (process.env.DIRECT_URL?.trim()) {
  console.log("[OK] DIRECT_URL（マイグレーション用・任意）");
}

if (failed) {
  process.exit(1);
}

console.log("\n環境変数チェック完了。続けて npm run build を実行してください。");
