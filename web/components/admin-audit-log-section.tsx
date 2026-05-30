import {
  formatAuditActionLabel,
  formatAuditTargetLabel,
  type AdminAuditLogEntry,
} from "@/lib/admin-audit-log";
import { formatTokyoDateTime } from "@/lib/format-datetime";

type AdminAuditLogSectionProps = {
  entries: AdminAuditLogEntry[];
};

export function AdminAuditLogSection({ entries }: AdminAuditLogSectionProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8eeed]">
      <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3">
        <h2 className="text-base font-semibold text-[#173b4a]">操作履歴</h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600">
          チームメッセージの追加・更新・削除を記録しています（直近50件）。
        </p>
      </div>

      <div className="px-4 py-4">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-[#e8eeed] bg-[#f7fbfb] px-3 py-3 text-sm text-zinc-600">
            操作履歴はまだありません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e8eeed] text-[#1f4c60]">
                  <th className="py-2 pr-4 font-medium">日時</th>
                  <th className="py-2 pr-4 font-medium">操作者</th>
                  <th className="py-2 pr-4 font-medium">操作</th>
                  <th className="py-2 pr-4 font-medium">対象</th>
                  <th className="py-2 font-medium">内容</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#f0f4f3] align-top">
                    <td className="py-3 pr-4 whitespace-nowrap text-zinc-700">
                      {formatTokyoDateTime(entry.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-[#173b4a]">{entry.actorName}</p>
                      <p className="text-xs text-zinc-500">{entry.actorEmail}</p>
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {formatAuditActionLabel(entry.action)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">
                      {formatAuditTargetLabel(entry.targetType)}
                    </td>
                    <td className="py-3 text-zinc-700">{entry.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
