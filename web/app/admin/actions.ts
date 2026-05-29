"use server";

import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";
import {
  parsePositiveMessageContent,
  parsePositiveMessageId,
} from "@/lib/positive-message";

function redirectAdmin(params?: Record<string, string>) {
  const query = new URLSearchParams(params);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  redirect(`/admin${suffix}`);
}

function redirectAdminError(message: string): never {
  const query = new URLSearchParams({
    msgError: encodeURIComponent(message),
  });
  redirect(`/admin?${query.toString()}`);
}

async function ensureAdminOrRedirectLogin() {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    redirect("/login?next=/admin");
  }
}

export async function createPositiveMessageAction(formData: FormData) {
  await ensureAdminOrRedirectLogin();

  const parsed = parsePositiveMessageContent(formData.get("content"));
  if (!parsed.ok) {
    redirectAdminError(parsed.error);
  }

  await prisma.positiveMessage.create({
    data: { content: parsed.content },
  });

  redirectAdmin({ msgSaved: "1" });
}

export async function updatePositiveMessageAction(formData: FormData) {
  await ensureAdminOrRedirectLogin();

  const id = parsePositiveMessageId(formData.get("id"));
  if (!id) {
    redirectAdminError("更新対象が見つかりません。");
  }

  const parsed = parsePositiveMessageContent(formData.get("content"));
  if (!parsed.ok) {
    redirectAdminError(parsed.error);
  }

  const messageId = id;
  const existing = await prisma.positiveMessage.findUnique({
    where: { id: messageId },
  });
  if (!existing) {
    redirectAdminError("更新対象が見つかりません。");
  }

  await prisma.positiveMessage.update({
    where: { id: messageId },
    data: { content: parsed.content },
  });

  redirectAdmin({ msgSaved: "1" });
}

export async function deletePositiveMessageAction(formData: FormData) {
  await ensureAdminOrRedirectLogin();

  const id = parsePositiveMessageId(formData.get("id"));
  if (!id) {
    redirectAdminError("削除対象が見つかりません。");
  }

  const messageId = id;
  const existing = await prisma.positiveMessage.findUnique({
    where: { id: messageId },
  });
  if (!existing) {
    redirectAdminError("削除対象が見つかりません。");
  }

  await prisma.positiveMessage.delete({ where: { id: messageId } });

  redirectAdmin({ msgDeleted: "1" });
}
