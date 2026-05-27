import { NextResponse } from "next/server";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";

export async function GET() {
  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getAppUserFromAccessToken(accessToken);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  return NextResponse.json({ role: user.role });
}

