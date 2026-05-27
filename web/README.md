# チーム・コンディション・チェッカー（Web）

Next.js + Prisma + PostgreSQL + Supabase Auth（マジックリンク）のチェックインアプリです。

## ローカル開発

### 前提

- Node.js 20+
- PostgreSQL（ローカル or Supabase）

### セットアップ

```bash
cd web
cp .env.example .env.local
# .env.local に実値を設定
npm install
npx prisma migrate deploy   # 初回。既に db push 済みの DB ではスキップ可
npm run dev
```

`http://localhost:3000` を開きます。

### よく使うコマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド（マイグレーションなし） |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript チェック |
| `npm run verify:env` | 必須環境変数の有無チェック |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:push` | スキーマを DB に直接反映（開発用） |

---

## 本番デプロイ（Vercel + Supabase）

本番運用は **Vercel（東京 `hnd1`）** + **Supabase（Auth + Postgres）** を想定しています。無料枠でも開始できますが、チーム人数・メール数が増えたら有料プランを検討してください。

### 1. Supabase（本番プロジェクト）

1. [Supabase](https://supabase.com) でプロジェクト作成（リージョン: 東京推奨）
2. **Authentication → URL Configuration**
   - **Site URL**: `https://<your-app>.vercel.app`
   - **Redirect URLs** に追加:
     - `https://<your-app>.vercel.app/auth/callback`
     - カスタムドメイン利用時はその URL も追加
3. **Project Settings → API** から以下を控える
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Project Settings → Database → Connection string**
   - **URI（Direct, port 5432）** を `DIRECT_URL` に（マイグレーション用・推奨）
   - 運用負荷が増えたら **Transaction pooler（6543）** を `DATABASE_URL` にし、`?pgbouncer=true` を付与

> **注意**: マジックリンクメールの「オプトアウト」リンクではなく、**ログイン用リンク**を開いてください。

### 2. Vercel

1. GitHub リポジトリをインポート
2. **Root Directory**: `web`
3. **Environment Variables**（Production / Preview 両方推奨）

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | Postgres 接続文字列（プールまたは Direct） |
| `DIRECT_URL` | （任意）`migrate deploy` 用の Direct 5432。未設定時は `DATABASE_URL` を使用 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

4. デプロイ（`vercel.json` で `build:vercel` = migrate + build）

初回デプロイ前にローカルで確認する場合:

```bash
cd web
# Production 用の値を export するか、.env.production.local を用意
npm run verify:env
npm run build:vercel
```

### 3. 管理者の付与（初回のみ）

本番 DB に接続し、管理者メールを `admin` に更新します。

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-admin@example.com';
```

Supabase SQL Editor または `npx prisma studio` で実行できます。

### 4. デプロイ後の確認（リリースチェックリスト）

- [ ] `GET https://<your-app>.vercel.app/api/health` が `{ "ok": true, "db": true }`
- [ ] `/login` からマジックリンクが届く
- [ ] ログイン後 `/auth/callback` → ホーム表示
- [ ] `/checkin` でチェックイン保存
- [ ] `/dashboard` に 7 日分表示
- [ ] 管理者で `/admin` にアクセスできる
- [ ] スマホで「ホーム画面に追加」（PWA）

### 5. 接続文字列の使い分け（本番運用）

| 用途 | 推奨 |
|------|------|
| Vercel ビルド時の `migrate deploy` | `DIRECT_URL`（5432 Direct） |
| ランタイム（API・Server Components） | `DATABASE_URL`（小規模なら Direct でも可。増加時は Pooler 6543） |

Prisma CLI は `prisma.config.ts` で `DIRECT_URL` を優先します。アプリ本体は `lib/prisma.ts` の `DATABASE_URL` のみ参照します。

---

## 環境変数

テンプレートは [`.env.example`](./.env.example) を参照。秘密情報は **コミットしない** でください。

---

## ディレクトリ概要

```
web/
├── app/              # Next.js App Router
├── components/       # UI・PWA
├── lib/              # 認証・Prisma・ドメインロジック
├── prisma/           # スキーマ・マイグレーション
├── public/sw.js      # PWA Service Worker
└── scripts/          # デプロイ前チェック
```

設計書: リポジトリ直下の `詳細設計書.md` / `基本設計書.md`

---

## トラブルシュート

| 症状 | 確認すること |
|------|----------------|
| ユーザー同期に失敗 | `DATABASE_URL`、DB 起動、`migrate deploy` 済みか |
| ログイン後に戻れない | Supabase Redirect URLs に本番 `/auth/callback` があるか |
| ビルドで Prisma 失敗 | Vercel に `DATABASE_URL` / `DIRECT_URL` が設定されているか |
| 管理者に入れない | `User.role = 'admin'` の SQL を本番 DB で実行したか |

---

## 改訂

- Step 14: 本番デプロイ手順・マイグレーション・ヘルスチェック API
