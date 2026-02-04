import fetch from "node-fetch";

export interface BigModelProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export class BigModelProvider {
  readonly name = "bigmodel";

  constructor(private config: BigModelProviderConfig) {
    if (!config.apiKey) {
      throw new Error("BigModel apiKey is required");
    }
    // normalize model choice
    const allowed = ["glm-4", "glm-4-air", "glm-4-flash"];
    if (!allowed.includes(config.model)) {
      throw new Error(`BigModelProvider: unsupported model ${config.model}. Allowed: ${allowed.join(", ")}`);
    }
  }

  private get baseUrl() {
    return this.config.baseUrl ?? "https://open.bigmodel.cn";
  }

  /**
   * OpenClaw message -> BigModel messages
   */
  private mapMessages(messages: any[]) {
    return messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));
  }

  /**
   * 非 streaming 对话
   */
  async chat(messages: any[]) {
    const res = await fetch(
      `${this.baseUrl}/api/paas/v4/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.mapMessages(messages),
          stream: false,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "<unreadable body>");
      throw new Error(`BigModel API error: ${res.status} ${text}`);
    }

    const data = await res.json().catch(() => ({}));

    return {
      role: "assistant",
      content: data.choices?.[0]?.message?.content ?? "",
      raw: data,
    };
  }
}
