import * as vscode from "vscode";
import * as semver from "semver";
import * as path from "path";
import * as fs from "fs";
import { fetchLatestVersionFromRepo } from "../../utils/api/versionAPI";
import { showUpdateWebview } from "./showUpdateWebview";

let updateAccepted = false; // cache user’s choice in session

export async function checkExtensionVersion(
  context: vscode.ExtensionContext
): Promise<boolean> {
  if (updateAccepted) return true; // user already accepted old version once

  const pkgPath = path.join(context.extensionPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const currentVersion = pkg.version;

  try {
    const latest = await fetchLatestVersionFromRepo();

    if (semver.lt(currentVersion, latest.version)) {
      const proceed = await showUpdateWebview(context, currentVersion, latest);
      updateAccepted = proceed; // remember user’s choice
      return proceed;
    }
  } catch (error) {
    console.warn("⚠️ Version check failed:", error);
  }

  return true; // if all ok, proceed normally
}
