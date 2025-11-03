import * as vscode from "vscode";
import axios from "axios";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

export async function showUpdateWebview(
  context: vscode.ExtensionContext,
  currentVersion: string,
  latest: { version: string; downloadUrl: string; notes?: string }
): Promise<boolean> {
  return new Promise((resolve) => {
    const panel = vscode.window.createWebviewPanel(
      "extensionUpdate",
      "Extension Update Available",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getUpdateHtml(currentVersion, latest);

    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "accept") {
        try {
          const tempFile = path.join(os.tmpdir(), `extension-${latest.version}.vsix`);
          const response = await axios.get(message.downloadUrl, {
            responseType: "arraybuffer",
          });
          fs.writeFileSync(tempFile, Buffer.from(response.data));
          vscode.commands.executeCommand(
            "workbench.extensions.installExtension",
            vscode.Uri.file(tempFile)
          );
          vscode.window.showInformationMessage(
            `Updated to version ${latest.version}. Please reload VS Code.`
          );
          resolve(true);
        } catch (e) {
          vscode.window.showErrorMessage(`Failed to download update: ${e}`);
          resolve(false);
        }
        panel.dispose();
      } else if (message.command === "reject") {
        resolve(true); // allow to continue old version
        panel.dispose();
      }
    });
  });
}

function getUpdateHtml(currentVersion: string, latest: any): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: sans-serif; padding: 20px; }
      .title { font-size: 20px; font-weight: bold; color: #07439C; }
      .version { margin-top: 10px; }
      button { margin: 10px 5px; padding: 8px 14px; border: none; cursor: pointer; border-radius: 4px; }
      .accept { background: #07439C; color: white; }
      .reject { background: gray; color: white; }
    </style>
  </head>
  <body>
    <h2 class="title">Update Available</h2>
    <p>Current version: <b>${currentVersion}</b></p>
    <p>Latest version: <b>${latest.version}</b></p>
    <p><strong>Release Notes:</strong><br>${latest.notes || "No notes available."}</p>
    <div>
      <button class="accept" onclick="vscode.postMessage({command:'accept', downloadUrl:'${latest.downloadUrl}'})">Update Now</button>
      <button class="reject" onclick="vscode.postMessage({command:'reject'})">Continue Anyway</button>
    </div>
    <script>
      const vscode = acquireVsCodeApi();
    </script>
  </body>
  </html>
  `;
}
