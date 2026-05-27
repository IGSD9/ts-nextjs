import type { DailyReport } from "@prisma/client";

/**
 * Step 09: ルールベースのセルフケアアドバイス（MVP）
 * 参照フィールドのみ: fog, mood, reportDate（入力日数の算出）
 * 外部 API は使わない。プロンプト相当のルールは本ファイルに固定。
 *
 * 優先度（上から最初にマッチした1文を返す）:
 * 1. 7日間レポート0件 → チェックイン促進
 * 2. 直近3日で fog===3 が2日以上 → 進め方・優先順位の見直し
 * 3. 直近3日で mood===3 が2日以上 → 休息・相談
 * 4. 直近7日で fog===3 が3日以上 → 中期的な霧の傾向
 * 5. 入力継続（3日以上）→ 肯定的フィードバック
 * 6. デフォルト → 継続を促す
 */

type ReportSlice = Pick<DailyReport, "reportDate" | "fog" | "mood">;

function sortByDateDesc(reports: ReportSlice[]): ReportSlice[] {
  return [...reports].sort(
    (a, b) => b.reportDate.getTime() - a.reportDate.getTime(),
  );
}

export function buildDashboardAdvice(reports: ReportSlice[]): string {
  if (reports.length === 0) {
    return "まずは今日のチェックインから始めましょう。短い入力で、自分の状態を振り返る第一歩になります。";
  }

  const recent = sortByDateDesc(reports).slice(0, 3);
  const heavyFogRecent = recent.filter((r) => r.fog === 3).length;
  const lowMoodRecent = recent.filter((r) => r.mood === 3).length;
  const heavyFogWeek = reports.filter((r) => r.fog === 3).length;

  if (heavyFogRecent >= 2) {
    return "直近で「濃霧」が続いています。今日はタスクを1つに絞るか、チームに進め方を相談してみてください。";
  }

  if (lowMoodRecent >= 2) {
    return "気分がしんどい日が続いています。無理に頑張らず、休息や信頼できる人への相談を検討してみてください。";
  }

  if (heavyFogWeek >= 3) {
    return "この1週間、進め方が見えにくい日が多めです。小さな成功体験を1つ作ると、霧が晴れることがあります。";
  }

  if (reports.length >= 3) {
    return "チェックインを続けられています。この調子で、自分のコンディションを見える化していきましょう。";
  }

  return "記録が増えるほど、自分の傾向が見えてきます。できれば毎日、短いチェックインを続けてみてください。";
}
