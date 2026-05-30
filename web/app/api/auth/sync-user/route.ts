import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function isDatabaseUnreachableError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      e.code === "P1001" ||
      e.code === "P1017" ||
      e.code === "ECONNREFUSED" ||
      e.code === "ETIMEDOUT"
    );
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("ECONNREFUSED") || msg.includes("Can't reach database server");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const extractDisplayName = (email: string) => {
  const localPart = email.split("@")[0]?.trim();
  return localPart && localPart.length > 0 ? localPart : "user";
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user?.email) {
    return NextResponse.json({ error: "Invalid Supabase session." }, { status: 401 });
  }

  const displayName = extractDisplayName(user.email);
  try {
    const appUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { lastLoginAt: new Date() },
      create: {
        email: user.email,
        name: displayName,
        lastLoginAt: new Date(),
      },
    });
    return NextResponse.json({ userId: appUser.id });
  } catch (e) {
    if (isDatabaseUnreachableError(e)) {
      return NextResponse.json(
        {
          error:
            "データベースに接続できません。PostgreSQL を起動するか、web/.env.local の DATABASE_URL を確認し、マイグレーション（npx prisma migrate deploy または db push）を実行してください。",
        },
        { status: 503 },
      );
    }
    // JSON で返すことで、フロント側がエラーメッセージを表示できるようにする
    const err = e as { code?: string; message?: string; name?: string };
    const safeMessage =
      err?.message?.slice?.(0, 240) ??
      err?.code ??
      err?.name ??
      "Unknown error";
    return NextResponse.json(
      {
        error: `ユーザー同期に失敗: ${safeMessage}`,
      },
      { status: 500 },
    );
  }
}
