import { createClient } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

function extractDisplayName(email: string) {
  const localPart = email.split("@")[0]?.trim();
  return localPart && localPart.length > 0 ? localPart : "user";
}

export async function syncAppUserFromAccessToken(accessToken: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user?.email) {
    throw new Error("Invalid Supabase session.");
  }

  const displayName = extractDisplayName(user.email);

  try {
    return await prisma.user.upsert({
      where: { email: user.email },
      update: { lastLoginAt: new Date() },
      create: {
        email: user.email,
        name: displayName,
        lastLoginAt: new Date(),
      },
    });
  } catch (e) {
    if (isDatabaseUnreachableError(e)) {
      throw new Error(
        "データベースに接続できません。DATABASE_URL とマイグレーションを確認してください。",
      );
    }
    throw e;
  }
}
