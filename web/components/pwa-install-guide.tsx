export function PwaInstallGuide() {
  return (
    <section
      id="pwa-install"
      className="mt-10 scroll-mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
    >
      <h2 className="text-sm font-semibold text-zinc-900">ホーム画面に追加</h2>
      <p className="mt-2 text-sm text-zinc-600">
        ホーム画面から起動すると、アプリのようにすぐチェックインできます。
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
        <li>
          <strong>Chrome / Edge（PC・Android）</strong>
          ：アドレスバーの「インストール」、またはメニュー →
          「アプリをインストール」
        </li>
        <li>
          <strong>iPhone（Safari）</strong>
          ：画面下の共有ボタン → 「ホーム画面に追加」
        </li>
        <li>
          <strong>Android（Chrome）</strong>
          ：メニュー → 「アプリをインストール」または「ホーム画面に追加」
        </li>
      </ol>
      <p className="mt-3 text-xs text-zinc-500">
        本番 URL（HTTPS）でアクセスすると、インストール案内が表示されやすくなります。
      </p>
    </section>
  );
}
