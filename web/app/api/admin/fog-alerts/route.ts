import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth-admin";
import {
  FOG_ALERT_CONSECUTIVE_CHECKINS,
  FOG_HEAVY_CODE,
  getFogAlertUsers,
} from "@/lib/fog-alert";

export const dynamic = "force-dynamic";

/**
 * Step 11: FOG アラート対象ユーザー一覧（管理者のみ）
 * Step 12 の /admin 画面からも利用可能。
 */
export async function GET() {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const alerts = await getFogAlertUsers();

  return NextResponse.json({
    alerts,
    meta: {
      heavyFogCode: FOG_HEAVY_CODE,
      consecutiveCheckinsRequired: FOG_ALERT_CONSECUTIVE_CHECKINS,
      count: alerts.length,
    },
  });
}
