import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { applySessionCookies } from "@/lib/auth-session";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { syncAppUserFromAccessToken } from "@/lib/sync-app-user";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextPath = requestUrl.searchParams.get("next") ?? "/";
  const redirectUrl = new URL(nextPath, requestUrl.origin);

  let response = NextResponse.redirect(redirectUrl);
  const supabase = createSupabaseRouteClient(request, response);

  let session = null;
  let authErrorMessage: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      authErrorMessage = error.message.includes("PKCE code verifier")
        ? "pkce_link"
        : error.message;
    } else {
      session = data.session;
    }
  } else if (tokenHash && type) {
    const otpTypes: EmailOtpType[] = [type as EmailOtpType, "email", "magiclink"];
    const uniqueTypes = [...new Set(otpTypes)];

    for (const otpType of uniqueTypes) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
      if (!error && data.session) {
        session = data.session;
        break;
      }
      authErrorMessage = error?.message ?? authErrorMessage;
    }
  } else {
    authErrorMessage = "認証情報が見つかりませんでした。";
  }

  if (authErrorMessage || !session) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set(
      "error",
      encodeURIComponent(authErrorMessage ?? "ログインに失敗しました。"),
    );
    return NextResponse.redirect(loginUrl);
  }

  try {
    await syncAppUserFromAccessToken(session.access_token);
  } catch (caughtError) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set(
      "error",
      encodeURIComponent(
        caughtError instanceof Error
          ? caughtError.message
          : "ユーザー同期に失敗しました。",
      ),
    );
    return NextResponse.redirect(loginUrl);
  }

  response = NextResponse.redirect(redirectUrl);
  applySessionCookies(response, {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  return response;
}
