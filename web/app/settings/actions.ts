"use server";

import { redirect } from "next/navigation";
import { getAccessTokenFromRequest, getAppUserFromAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDisplayName } from "@/lib/user-name";

export async function updateDisplayNameAction(formData: FormData) {
  const accessToken = await getAccessTokenFromRequest();
  const appUser = await getAppUserFromAccessToken(accessToken);

  if (!appUser) {
    redirect("/login");
  }

  const parsed = parseDisplayName(formData.get("name"));
  if (!parsed.ok) {
    redirect(`/settings?error=${encodeURIComponent(parsed.error)}`);
  }

  await prisma.user.update({
    where: { id: appUser.id },
    data: { name: parsed.name },
  });

  redirect("/settings?saved=1");
}
