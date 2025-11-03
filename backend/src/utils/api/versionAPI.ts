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
