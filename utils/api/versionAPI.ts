import axios from "axios";

export async function fetchLatestVersionFromRepo(): Promise<{
  version: string;
  downloadUrl: string;
  notes?: string;
}> {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/<your-org>/<your-repo>/releases/latest"
    );

    return {
      version: response.data.tag_name.replace(/^v/, ""), // strip "v"
      downloadUrl: response.data.assets[0]?.browser_download_url || "",
      notes: response.data.body || "",
    };
  } catch (error) {
    console.error("❌ Failed to fetch latest version:", error);
    throw new Error("Unable to check for updates.");
  }
}
