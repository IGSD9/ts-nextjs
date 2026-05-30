"use server";

import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";
import {
  parsePositiveMessageContent,
  parsePositiveMessageId,
} from "@/lib/positive-message";

function redirectAdminMessages(params?: Record<string, string>) {
  const query = new URLSearchParams(params);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  redirect(`/admin/messages${suffix}`);
}

function redirectAdminMessagesError(message: string): never {
  const query = new URLSearchParams({
    msgError: encodeURIComponent(message),
  });
  redirect(`/admin/messages?${query.toString()}`);
}

async function ensureAdminOrRedirectLogin() {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    redirect("/login?next=/admin/messages");
  }
}

export async function createPositiveMessageAction(formData: FormData) {
  await ensureAdminOrRedirectLogin();

  const parsed = parsePositiveMessageContent(formData.get("content"));
  if (!parsed.ok) {
    redirectAdminMessagesError(parsed.error);
  }

  await prisma.positiveMessage.create({
    data: { content: parsed.content },
  });

  redirectAdminMessages({ msgSaved: "1" });
}

export async function updatePositiveMessageAction(formData: FormData) {
  await ensureAdminOrRedirectLogin();

  const id = parsePositiveMessageId(formData.get("id"));
  if (!id) {
    redirectAdminMessagesError("更新対象が見つかりません。");
  }

  const parsed = parsePositiveMessageContent(formData.get("content"));
  if (!parsed.ok) {
    redirectAdminMessagesError(parsed.error);
  }

  const messageId = id;
  const existing = await prisma.positiveMessage.findUnique({
    where: { id: messageId },
  });
  if (!existing) {
    redirectAdminMessagesError("更新対象が見つかりません。");
  }

  await prisma.positiveMessage.update({
    where: { id: messageId },
    data: { content: parsed.content },
  });

  redirectAdminMessages({ msgSaved: "1" });
}

export async function deletePositiveMessageAction(formData: FormData) {
  await ensureAdminOrRedirectLogin();

  const id = parsePositiveMessageId(formData.get("id"));
  if (!id) {
    redirectAdminMessagesError("削除対象が見つかりません。");
  }

  const messageId = id;
  const existing = await prisma.positiveMessage.findUnique({
    where: { id: messageId },
  });
  if (!existing) {
    redirectAdminMessagesError("削除対象が見つかりません。");
  }

  await prisma.positiveMessage.delete({ where: { id: messageId } });

  redirectAdminMessages({ msgDeleted: "1" });
}
