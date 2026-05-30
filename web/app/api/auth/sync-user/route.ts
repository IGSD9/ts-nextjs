import { NextResponse } from "next/server";
import { syncAppUserFromAccessToken } from "@/lib/sync-app-user";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  try {
    const appUser = await syncAppUserFromAccessToken(accessToken);
    return NextResponse.json({ userId: appUser.id });
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : "Unknown error";
    const status = message.includes("データベース") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
