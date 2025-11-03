import axios from "axios";
import * as path from "path";
import * as dotenv from "dotenv";

// ✅ Load .env from project root (outside src)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const GHE_USER = process.env.GHE_USER;
const GHE_PASS = process.env.GHE_PASS;

// ✅ Validate presence of credentials
if (!GHE_USER || !GHE_PASS) {
  console.error("❌ Missing GHE_USER or GHE_PASS in .env file.");
}

// Your internal GitHub Enterprise repo release URL
const REPO_RELEASE_URL =
  "https://alm-github.systems.uk.hsbc/api/v3/repos/iWPB-HSBC-intelligent-Automation/codegenie_vsext_versions/releases/latest";

/**
 * Fetch the latest version tag from HSBC GitHub Enterprise.
 */
export async function fetchLatestVersion(): Promise<string | null> {
  try {
    const response = await axios.get(REPO_RELEASE_URL, {
      auth: {
        username: GHE_USER || "",
        password: GHE_PASS || "",
      },
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (response.data && response.data.tag_name) {
      const latest = response.data.tag_name.replace(/^v/, "");
      console.log("✅ Latest version from repo:", latest);
      return latest;
    }

    console.warn("⚠️ No tag_name found in API response.");
    return null;
  } catch (error: any) {
    console.error("❌ Failed to fetch latest version:", error.message);
    return null;
  }
}











================================

  version check

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



npx ts-node src/utils/api/versionAPI.ts

