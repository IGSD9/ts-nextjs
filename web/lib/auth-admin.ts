import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";
import type { User } from "@prisma/client";

type AdminAuthResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 403; message: string };

/** Step 11/12: 管理者 API・画面用 */
export async function requireAdminUser(): Promise<AdminAuthResult> {
  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken) {
    return { ok: false, status: 401, message: "Not authenticated." };
  }

  const user = await getAppUserFromAccessToken(accessToken);
  if (!user) {
    return { ok: false, status: 401, message: "User not found." };
  }

  if (user.role !== "admin") {
    return { ok: false, status: 403, message: "Admin access required." };
  }

  return { ok: true, user };
}
