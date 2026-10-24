// plugin-azure-service-bus-mcp
// Works with Azure Service Bus.
// Grant requested: comment-task (the plugin only ever returns comment operations).

const MCP_SERVER_KEY = "servicebus";
const MCP_SERVER_CONFIG = {
  "command": "npx",
  "args": [
    "-y",
    "azure-service-bus-mcp",
    "--connection-string",
    "Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<key-name>;SharedAccessKey=<key>"
  ]
};
const SETUP_STEPS = [
  "Create a shared access policy with Listen and Send on the namespace.",
  "Store the connection string in the workspace secrets store.",
  "Add the entry to the workspace MCP configuration."
];
const DOCS_URL = "https://www.npmjs.com/package/azure-service-bus-mcp";
const MAX_COMMENT_LENGTH = 10000;

function asString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

export function buildSetupComment(event) {
  const lines = [];
  lines.push("### Azure Service Bus MCP — workspace configuration");
  lines.push("");
  lines.push("This workspace has the **Azure Service Bus MCP** plugin installed.");
  lines.push("It installs and configures the Azure Service Bus MCP server: the agent can then list queues and subscriptions, peek messages, check dead letters and send test events on Service Bus.");
  const title = asString(event && event.taskTitle);
  if (title) {
    lines.push("");
    lines.push("Task: **" + title + "**");
  }
  lines.push("");
  lines.push("Add this entry to the workspace `mcp.servers` configuration:");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify({ [MCP_SERVER_KEY]: MCP_SERVER_CONFIG }, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("**Setup**");
  for (let i = 0; i < SETUP_STEPS.length; i++) {
    lines.push((i + 1) + ". " + SETUP_STEPS[i]);
  }
  lines.push("");
  lines.push("Docs: " + DOCS_URL);
  let text = lines.join("\n");
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH - 3) + "...";
  }
  return text;
}

export async function taskCreated(event) {
  const text = buildSetupComment(event);
  if (!text) return [];
  return [{ type: "comment", value: text }];
}

export const hooks = {
  "task.created": taskCreated,
};
