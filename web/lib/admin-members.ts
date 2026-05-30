import { formatTokyoDate, isSameTokyoDate } from "@/lib/format-datetime";
import { parseDateOnlyUtc, tokyoDateString } from "@/lib/pizza-meter";
import { prisma } from "@/lib/prisma";

export type AdminMemberRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  lastLoginAt: Date | null;
  lastLoginLabel: string;
  loggedInToday: boolean;
  reportCount: number;
  lastReportDate: string | null;
  checkedInToday: boolean;
};

export type AdminMembersSummary = {
  totalUsers: number;
  adminCount: number;
  respondentCount: number;
  loggedInTodayCount: number;
  checkedInTodayCount: number;
  todayLabel: string;
};

export type AdminMembersResult = {
  summary: AdminMembersSummary;
  members: AdminMemberRow[];
};

export async function getAdminMembers(): Promise<AdminMembersResult> {
  const todayLabel = tokyoDateString();
  const todayDate = parseDateOnlyUtc(todayLabel);

  const [users, todayReporterGroups] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
        _count: { select: { reports: true } },
        reports: {
          orderBy: { reportDate: "desc" },
          take: 1,
          select: { reportDate: true },
        },
      },
    }),
    prisma.dailyReport.groupBy({
      by: ["userId"],
      where: { reportDate: todayDate },
    }),
  ]);

  const checkedInTodayIds = new Set(todayReporterGroups.map((row) => row.userId));

  const members: AdminMemberRow[] = users.map((user) => {
    const lastReport = user.reports[0]?.reportDate ?? null;
    const isAdmin = user.role === "admin";

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin,
      lastLoginAt: user.lastLoginAt,
      lastLoginLabel: formatTokyoDateTimeLabel(user.lastLoginAt),
      loggedInToday: isSameTokyoDate(user.lastLoginAt, todayLabel),
      reportCount: user._count.reports,
      lastReportDate: lastReport ? formatTokyoDate(lastReport) : null,
      checkedInToday: checkedInTodayIds.has(user.id),
    };
  });

  return {
    summary: {
      totalUsers: members.length,
      adminCount: members.filter((member) => member.isAdmin).length,
      respondentCount: members.filter((member) => member.reportCount > 0).length,
      loggedInTodayCount: members.filter((member) => member.loggedInToday).length,
      checkedInTodayCount: members.filter((member) => member.checkedInToday).length,
      todayLabel,
    },
    members,
  };
}

function formatTokyoDateTimeLabel(value: Date | null): string {
  if (!value) return "未記録";
  return value.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
