import { prisma } from "@/lib/prisma";

export type AdminAuditAction = "create" | "update" | "delete";
export type AdminAuditTargetType = "positive_message";

export type AdminAuditLogEntry = {
  id: string;
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string;
  summary: string;
  createdAt: Date;
  actorName: string;
  actorEmail: string;
};

const AUDIT_LOG_LIMIT = 50;

export function truncateAuditSummary(text: string, max = 80): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export async function writeAdminAuditLog(params: {
  actorUserId: string;
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string;
  summary: string;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      summary: params.summary,
    },
  });
}

export async function getAdminAuditLogs(): Promise<AdminAuditLogEntry[]> {
  const rows = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: AUDIT_LOG_LIMIT,
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      summary: true,
      createdAt: true,
      actor: {
        select: { name: true, email: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    action: row.action as AdminAuditAction,
    targetType: row.targetType as AdminAuditTargetType,
    targetId: row.targetId,
    summary: row.summary,
    createdAt: row.createdAt,
    actorName: row.actor.name,
    actorEmail: row.actor.email,
  }));
}

export function formatAuditActionLabel(action: AdminAuditAction): string {
  switch (action) {
    case "create":
      return "追加";
    case "update":
      return "更新";
    case "delete":
      return "削除";
  }
}

export function formatAuditTargetLabel(targetType: AdminAuditTargetType): string {
  switch (targetType) {
    case "positive_message":
      return "チームメッセージ";
  }
}
