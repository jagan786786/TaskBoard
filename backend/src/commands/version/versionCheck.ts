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










import * as vscode from "vscode";
import { fetchLatestVersion } from "../../utils/api/versionAPI";
import { showUpdateWebview } from "../../webview/update_webview/showUpdatedWebview";

export async function checkExtensionVersion(context: vscode.ExtensionContext): Promise<boolean> {
  try {
    // Be sure to use the exact extension id that matches package.json: "<publisher>.<name>"
    const extensionId = "HSBC.genie-vscode-hsbc"; // <-- REPLACE with your real id if different
    const ext = vscode.extensions.getExtension(extensionId);
    const localVersionRaw = ext?.packageJSON?.version;
    console.log("[versionCheck] localVersionRaw:", localVersionRaw, "type:", typeof localVersionRaw);

    // Make sure we await the promise
    const latestRaw = await fetchLatestVersion();
    console.log("[versionCheck] latestRaw:", latestRaw, "type:", typeof latestRaw);

    const localVersion = normalizeVersion(localVersionRaw);
    const latestVersion = normalizeVersion(latestRaw);

    console.log("[versionCheck] normalized -> local:", localVersion, "latest:", latestVersion);

    if (!localVersion || !latestVersion) {
      console.warn("[versionCheck] Missing version information. Skipping check.");
      return true;
    }

    if (isVersionOutdated(localVersion, latestVersion)) {
      const accepted = await showUpdateWebview(context, localVersion, latestVersion);
      if (accepted) {
        vscode.env.openExternal(vscode.Uri.parse("https://alm-github.systems.uk.hsbc/.../releases"));
        return false;
      } else {
        await context.globalState.update("versionRejected", localVersion);
        return true;
      }
    } else {
      await context.globalState.update("versionRejected", undefined);
      return true;
    }
  } catch (err: any) {
    console.error("[versionCheck] failed:", err?.message || err);
    // Allow extension to continue on errors (optional)
    return true;
  }
}

/** Safely coerce version value to "x.y.z" string, or return null if cannot. */
function normalizeVersion(v: any): string | null {
  if (!v && v !== 0) return null;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;
    return s.replace(/^v/i, "");
  }
  if (typeof v === "number") {
    return String(v);
  }
  // if it's an object with tag_name or name
  if (typeof v === "object") {
    if (v.tag_name) return String(v.tag_name).trim().replace(/^v/i, "");
    if (v.name) return String(v.name).trim().replace(/^v/i, "");
    // maybe it's { data: { tag_name: ... } }
    if (v.data && (v.data.tag_name || v.data.name)) {
      return String(v.data.tag_name || v.data.name).trim().replace(/^v/i, "");
    }
    // fallback to JSON string (not ideal)
    return JSON.stringify(v);
  }
  // unknown
  return null;
}

/** Compare semantic version numbers (simple numeric compare, not full semver) */
function isVersionOutdated(local: string, remote: string): boolean {
  // Ensure both are strings
  if (typeof local !== "string" || typeof remote !== "string") {
    console.error("[isVersionOutdated] invalid types:", typeof local, typeof remote);
    return false;
  }

  const toNums = (s: string) => s.split(".").map(p => parseInt((p || "0").replace(/[^\d]/g, ""), 10) || 0);
  const [l1, l2, l3] = toNums(local);
  const [r1, r2, r3] = toNums(remote);

  if (r1 > l1) return true;
  if (r1 === l1 && r2 > l2) return true;
  if (r1 === l1 && r2 === l2 && r3 > l3) return true;
  return false;
}
