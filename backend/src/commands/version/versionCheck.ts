import * as vscode from "vscode";
import { fetchLatestVersion } from "../../utils/api/versionAPI";
import { showUpdateWebview } from "./showUpdateWebview";

export async function checkExtensionVersion(context: vscode.ExtensionContext): Promise<boolean> {
  try {
    const localVersion = vscode.extensions.getExtension("yourpublisher.yourextensionid")?.packageJSON.version;
    const latestVersion = await fetchLatestVersion();

    if (!localVersion || !latestVersion) {
      console.log("⚠️ Could not fetch version info. Skipping version check.");
      return true;
    }

    if (isVersionOutdated(localVersion, latestVersion)) {
      const accepted = await showUpdateWebview(context, localVersion, latestVersion);
      if (accepted) {
        vscode.env.openExternal(vscode.Uri.parse("https://alm-github.systems.uk.hsbc/iWPB-HSBC-intelligent-Automation/codegenie_vsext_versions/releases"));
        return false; // Stop activation until they update manually
      } else {
        // Store user rejection for current version
        context.globalState.update("versionRejected", localVersion);
        return true;
      }
    } else {
      context.globalState.update("versionRejected", undefined);
      return true;
    }
  } catch (err) {
    console.error("Version check failed:", err);
    return true; // Allow extension to continue even if check fails
  }
}

function isVersionOutdated(local: string, remote: string): boolean {
  const toNum = (v: string) => v.split(".").map(n => parseInt(n, 10));
  const [l1, l2, l3] = toNum(local);
  const [r1, r2, r3] = toNum(remote);
  if (r1 > l1) return true;
  if (r1 === l1 && r2 > l2) return true;
  if (r1 === l1 && r2 === l2 && r3 > l3) return true;
  return false;
}
