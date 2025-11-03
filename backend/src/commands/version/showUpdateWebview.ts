import * as vscode from "vscode";

export async function showUpdateWebview(
  context: vscode.ExtensionContext,
  localVersion: string,
  latestVersion: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const panel = vscode.window.createWebviewPanel(
      "versionUpdateView",
      "CodeGenie Version Update",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getHtml(localVersion, latestVersion);

    panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === "accept") {
          vscode.window.showInformationMessage("Redirecting to update page...");
          resolve(true);
          panel.dispose();
        } else if (message.command === "reject") {
          vscode.window.showWarningMessage("You chose to stay on current version.");
          resolve(false);
          panel.dispose();
        }
      },
      undefined,
      context.subscriptions
    );
  });
}

function getHtml(localVersion: string, latestVersion: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <body style="font-family: sans-serif; padding: 20px;">
    <h2>⚡ CodeGenie Update Available</h2>
    <p>Your current version: <b>${localVersion}</b></p>
    <p>Latest available version: <b>${latestVersion}</b></p>
    <p>Would you like to update to the latest version?</p>
    <button id="accept">✅ Accept</button>
    <button id="reject">❌ Reject</button>
    <script>
      const vscode = acquireVsCodeApi();
      document.getElementById('accept').addEventListener('click', () => {
        vscode.postMessage({ command: 'accept' });
      });
      document.getElementById('reject').addEventListener('click', () => {
        vscode.postMessage({ command: 'reject' });
      });
    </script>
  </body>
  </html>`;
}
