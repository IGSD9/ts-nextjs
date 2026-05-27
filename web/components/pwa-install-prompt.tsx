"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tc-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  );
}

function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function shouldShowInstallPrompt() {
  if (typeof window === "undefined") {
    return false;
  }
  if (isStandaloneDisplay()) {
    return false;
  }
  return localStorage.getItem(STORAGE_KEY) !== "1";
}

export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(shouldShowInstallPrompt);
  const [isIos] = useState(isIosDevice);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, [visible]);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  }, [deferredPrompt, dismiss]);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="ホーム画面に追加"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-4 shadow-lg"
    >
      <p className="text-sm font-medium text-zinc-900">ホーム画面に追加</p>
      <p className="mt-1 text-sm text-zinc-600">
        {deferredPrompt
          ? "ワンタップでアプリのように起動できます。"
          : isIos
            ? "Safari の共有メニューから「ホーム画面に追加」を選んでください。"
            : "ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選べます。"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {deferredPrompt ? (
          <button
            type="button"
            onClick={() => void install()}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white"
          >
            インストール
          </button>
        ) : null}
        <Link
          href="/settings#pwa-install"
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900"
        >
          手順を見る
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-500"
        >
          あとで
        </button>
      </div>
    </div>
  );
}
