import { checkExtensionVersion } from "./commands/version/versionCheck";

export async function activate(context: vscode.ExtensionContext) {
  const canProceed = await checkExtensionVersion(context);
  if (!canProceed) return; // Stop activation if user chooses update

  // 🧠 Continue with your existing logic below
  // all your sidebar, token, and Genie command setup
}
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const GHE_API_URL =
  "https://alm-github.systems.uk.hsbc/api/v3/repos/iWPB-HSBC-intelligent-Automation/codegenie_vsext_versions/releases/latest";

async function fetchLatestVersion() {
  try {
    const username = process.env.GHE_USER;
    const password = process.env.GHE_PASS;

    console.log("Loaded ENV =>", username ? "✅ USER found" : "❌ USER missing");

    if (!username || !password) {
      console.error("❌ Missing GHE_USER or GHE_PASS in environment file (.env)");
      return;
    }

    console.log("⏳ Fetching latest version...");
    const response = await axios.get(GHE_API_URL, {
      auth: { username, password },
      headers: { Accept: "application/vnd.github+json" },
    });

    console.log("✅ Response data:", response.data);
    const latestVersion = response.data.tag_name || response.data.name;
    console.log("🚀 Latest Release Version:", latestVersion);
  } catch (err: any) {
    console.error("❌ Error fetching version:", err.message);
  }
}

fetchLatestVersion();
