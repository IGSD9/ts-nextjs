const installSteps = [
  {
    platform: "Chrome / Edge（PC・Android）",
    steps: [
      "アドレスバーの「インストール」をタップ",
      "または メニュー →「アプリをインストール」",
    ],
  },
  {
    platform: "iPhone（Safari）",
    steps: ["画面下の共有ボタン →「ホーム画面に追加」"],
  },
  {
    platform: "Android（Chrome）",
    steps: ["メニュー →「アプリをインストール」または「ホーム画面に追加」"],
  },
] as const;

export function PwaInstallGuide() {
  return (
    <section
      id="pwa-install"
      className="mt-8 scroll-mt-6 overflow-hidden rounded-2xl border border-[#e8eeed]"
    >
      <div className="border-b border-[#e8eeed] bg-gradient-to-b from-[#f8f5ea]/80 to-white px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-[#173b4a]">ホーム画面に追加</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          ホーム画面から起動すると、アプリのようにすぐチェックインできます。
        </p>
      </div>

      <ul className="space-y-3 px-4 py-4 sm:px-5">
        {installSteps.map((item) => (
          <li
            key={item.platform}
            className="rounded-xl border border-[#e8eeed] bg-[#f7fbfb]/60 p-4"
          >
            <p className="text-sm font-semibold text-[#1f4c60]">{item.platform}</p>
            <ol className="mt-2 space-y-1.5">
              {item.steps.map((step) => (
                <li
                  key={step}
                  className="flex gap-2 text-sm leading-relaxed text-zinc-700"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c4a05e]"
                    aria-hidden
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </section>
  );
}
