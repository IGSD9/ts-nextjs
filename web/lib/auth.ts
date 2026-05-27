import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export const ACCESS_TOKEN_COOKIE_NAME = "tc_access_token";

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

export async function getAccessTokenFromRequest(): Promise<string> {
  const authHeader = (await headers()).get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? "";
}

export async function getSupabaseUserFromAccessToken(accessToken: string) {
  if (!accessToken) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user?.email) return null;
  return user;
}

export async function getAppUserFromAccessToken(accessToken: string) {
  const supabaseUser = await getSupabaseUserFromAccessToken(accessToken);
  if (!supabaseUser?.email) return null;

  return prisma.user.findUnique({ where: { email: supabaseUser.email } });
}

