import { NextResponse } from "next/server";
import {
  applySessionCookies,
  isAccessTokenValid,
} from "@/lib/auth-session";

type SetSessionBody = {
  accessToken?: string;
  refreshToken?: string;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const headerAccessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  const body = (await request.json().catch(() => null)) as SetSessionBody | null;
  const accessToken = body?.accessToken?.trim() || headerAccessToken;
  const refreshToken = body?.refreshToken?.trim() ?? "";

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { error: "Missing access token or refresh token." },
      { status: 400 },
    );
  }

  if (!(await isAccessTokenValid(accessToken))) {
    return NextResponse.json({ error: "Invalid access token." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  applySessionCookies(response, {
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return response;
}
