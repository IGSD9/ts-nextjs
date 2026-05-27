export const PWA_APP_NAME = "チーム・コンディション・チェッカー";
export const PWA_APP_SHORT_NAME = "TeamCodi";
export const PWA_THEME_COLOR = "#18181b";
export const PWA_BACKGROUND_COLOR = "#ffffff";

/** ImageResponse 用のアイコン（インラインスタイルのみ） */
export function getPwaIconElement(size: number) {
  const fontSize = Math.round(size * 0.34);
  const radius = Math.round(size * (size >= 128 ? 0.2 : 0.18));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PWA_THEME_COLOR,
        borderRadius: radius,
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: -1,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        TC
      </div>
    </div>
  );
}
