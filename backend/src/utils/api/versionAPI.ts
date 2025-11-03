import axios from "axios";
import * as path from "path";
import * as dotenv from "dotenv";

// ✅ Load .env file from project root (one folder above /src)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const GHE_USER = process.env.GHE_USER;
const GHE_PASS = process.env.GHE_PASS;

// Your internal GitHub Enterprise Releases API URL
const REPO_RELEASE_URL =
  "https://alm-github.systems.uk.hsbc/api/v3/repos/iWPB-HSBC-intelligent-Automation/codegenie_vsext_versions/releases/latest";

export async function fetchLatestVersion(): Promise<string | null> {
  try {
    const response = await axios.get(REPO_RELEASE_URL, {
      auth: {
        username: GHE_USER || "",
        password: GHE_PASS || "",
      },
    });

    if (response.data && response.data.tag_name) {
      return response.data.tag_name.replace(/^v/, ""); // e.g. "v1.2.0" → "1.2.0"
    }
    return null;
  } catch (error: any) {
    console.error("❌ Error fetching latest version:", error.message);
    return null;
  }
}



import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("GHE_USER:", process.env.GHE_USER);
console.log("GHE_PASS:", process.env.GHE_PASS);
Then run:

bash
Copy code
npx ts-node src/testEnv.ts
