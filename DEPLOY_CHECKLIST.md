# 本番デプロイ手順（チェックリスト）

既存 Supabase プロジェクト: `ghisemscbexvededtzuy`（`.env.local` と同じ）

管理者メール（SQL 用）: `kirutooo333@gmail.com`

---

## 1. GitHub に push

### 1-1. GitHub で空リポジトリを作成

1. https://github.com/new を開く
2. Repository name 例: `team-condition-checker`
3. **Private** 推奨（チーム内ツールのため）
4. **README / .gitignore は追加しない**（ローカルに既にあるため）
5. Create repository

### 1-2. ローカルから push（ターミナル）

リポジトリ作成後、表示される URL を使う:

```bash
cd "/Users/ikegawasyodai/Documents/project/team codi"
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git branch -M main
git push -u origin main
```

SSH の場合:

```bash
git remote add origin git@github.com:<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

---

## 2. Vercel にデプロイ

1. https://vercel.com/new → **Import Git Repository**
2. 上記 GitHub リポジトリを選択
3. **Root Directory** → `Edit` → **`web`** を指定（重要）
4. Framework: Next.js（自動検出）
5. **Environment Variables** を追加（Production）:

| Name | 値の取得元 |
|------|------------|
| `DATABASE_URL` | Supabase → Database → Connection string → **URI**（パスワード入り） |
| `DIRECT_URL` | 同上（初回 migrate 用。同じ URI で可） |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` と同じ `https://ghisemscbexvededtzuy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon public key（`.env.local` と同じ） |

6. **Deploy** をクリック
7. 完了後 URL をメモ（例: `https://team-condition-checker.vercel.app`）

> ビルドは `prisma migrate deploy` → `next build` が走ります。`DATABASE_URL` 未設定だと失敗します。

---

## 3. Supabase の Redirect URL

1. https://supabase.com/dashboard → プロジェクト `ghisemscbexvededtzuy`
2. **Authentication** → **URL Configuration**
3. 設定:

| 項目 | 値 |
|------|-----|
| **Site URL** | `https://<Vercelのドメイン>/` |
| **Redirect URLs** に追加 | `https://<Vercelのドメイン>/auth/callback` |

例:

```
Site URL: https://team-condition-checker.vercel.app
Redirect URLs: https://team-condition-checker.vercel.app/auth/callback
```

4. **Save**

---

## 4. 本番 DB マイグレーション

**Vercel の初回デプロイが成功していれば自動完了**（`build:vercel` 内の `prisma migrate deploy`）。

### 確認

- Vercel → Deployments → 最新 → **Building** ログに `migrate deploy` 成功があるか
- または Supabase → **Table Editor** に `User`, `DailyReport`, `PositiveMessage` があるか

### 手動でやる場合（ビルド失敗時）

ローカルで本番 `DATABASE_URL` を一時 export して:

```bash
cd web
export DATABASE_URL="postgresql://..."   # Supabase URI
npx prisma migrate deploy
```

---

## 5. 管理者 role の SQL

1. Supabase → **SQL Editor** → New query
2. 実行:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'kirutooo333@gmail.com';
```

> 先に本番で一度ログインして `User` 行が作成されている必要があります。  
> 未ログインの場合は、先に手順 6 でログイン → 再度この SQL。

---

## 6. 実機確認

| # | 確認 | OK |
|---|------|-----|
| 1 | `https://<ドメイン>/api/health` → `{"ok":true,"db":true}` | ☐ |
| 2 | `/login` でメール送信 → **ログイン用リンク**を開く（オプトアウト URL ではない） | ☐ |
| 3 | ログイン後ホーム表示 | ☐ |
| 4 | `/checkin` で保存 → 完了画面 | ☐ |
| 5 | `/dashboard` に記録表示 | ☐ |
| 6 | `/admin` に管理者で入れる | ☐ |
| 7 | スマホ Safari/Chrome で「ホーム画面に追加」 | ☐ |

---

## トラブル時

| 症状 | 対処 |
|------|------|
| ビルド失敗（Prisma） | Vercel の `DATABASE_URL` / `DIRECT_URL`、Supabase DB パスワード |
| ユーザー同期失敗 | 上記 + Table Editor でテーブル有無 |
| メールリンクでログインできない | Redirect URLs に **本番** `/auth/callback` があるか |
| 管理者に入れない | SQL 実行後、再ログイン |

---

## 完了の目安

- [ ] GitHub にコードがある
- [ ] Vercel Production が緑（Ready）
- [ ] health API が OK
- [ ] チームメンバーが本番 URL でチェックインできる
