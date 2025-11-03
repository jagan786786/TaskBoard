import { checkExtensionVersion } from "./commands/version/versionCheck";

export async function activate(context: vscode.ExtensionContext) {
  const canProceed = await checkExtensionVersion(context);
  if (!canProceed) return; // Stop activation if user chooses update

  // 🧠 Continue with your existing logic below
  // all your sidebar, token, and Genie command setup
}
