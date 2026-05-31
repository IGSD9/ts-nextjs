export function formatLoginErrorMessage(message: string): string {
  if (message === "pkce_link") {
    return "メール内リンクをアプリ内ブラウザで開いたためログインに失敗しました。リンクを長押しして「Safariで開く」または「Chromeで開く」を選んでください。";
  }

  if (message.includes("PKCE code verifier")) {
    return formatLoginErrorMessage("pkce_link");
  }

  return message;
}
