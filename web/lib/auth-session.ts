import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const ACCESS_TOKEN_COOKIE_NAME = "tc_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "tc_refresh_token";
export const ACCESS_TOKEN_HEADER_NAME = "x-tc-access-token";
/** 明示的ログアウトまで維持（refresh token で access token を更新） */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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

export type ResolvedSession = {
  accessToken: string;
  refreshToken: string;
  refreshed: boolean;
};

export async function isAccessTokenValid(accessToken: string): Promise<boolean> {
  if (!accessToken) return false;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  return !error && !!user;
}

export async function refreshAccessToken(refreshToken: string) {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) return null;
  return data.session;
}

export function applySessionCookies(
  response: NextResponse,
  session: { access_token: string; refresh_token: string },
) {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: session.access_token,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE_NAME,
    value: session.refresh_token,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
}

/** access token 失効時は refresh し、必要なら Cookie と request header を更新 */
export async function resolveSessionFromRequest(
  request: NextRequest,
): Promise<ResolvedSession | null> {
  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? "";
  const refreshToken =
    request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? "";

  if (accessToken && (await isAccessTokenValid(accessToken))) {
    return {
      accessToken,
      refreshToken,
      refreshed: false,
    };
  }

  if (!refreshToken) return null;

  const session = await refreshAccessToken(refreshToken);
  if (!session) return null;

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    refreshed: true,
  };
}

export function attachAccessTokenHeader(
  request: NextRequest,
  accessToken: string,
): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(ACCESS_TOKEN_HEADER_NAME, accessToken);
  return requestHeaders;
}
