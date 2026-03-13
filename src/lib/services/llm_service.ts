import { Command } from "@tauri-apps/plugin-shell";
import type { LLMMessage, SidecarConfig, SidecarStatus } from "../types/llm";

export class LLMService {
  private status: SidecarStatus = {
    isRunning: false,
    output: "",
  };

  private onStatusChange: (status: SidecarStatus) => void;

  constructor(onStatusChange: (status: SidecarStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  async startSidecar(config: SidecarConfig) {
    this.updateStatus({
      output: this.status.output + "Starting LLM sidecar...\n",
    });

    try {
      const command = Command.sidecar("binaries/llama-server", [
        "-m",
        config.modelPath,
        "--port",
        config.port.toString(),
        "-c",
        config.contextLength.toString(),
      ]);

      const child = await command.spawn();
      this.updateStatus({
        isRunning: true,
        pid: child.pid,
        output: this.status.output + `LLM Sidecar PID: ${child.pid}\n`,
      });

      command.stdout.on("data", (line: string) => {
        this.updateStatus({ output: this.status.output + `LLM: ${line}\n` });
      });

      command.stderr.on("data", (line: string) => {
        this.updateStatus({
          output: this.status.output + `Log: ${line}\n`,
        });
      });

      return child;
    } catch (err) {
      const errorMsg = `Failed to start sidecar: ${err}\n`;
      this.updateStatus({ output: this.status.output + errorMsg });
      throw err;
    }
  }

  async sendMessage(message: string, port: number) {
    const response = await fetch(
      `http://localhost:${port}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a helpful, concise, and friendly AI assistant.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
          stream: true,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          top_p: 0.9,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle SSE streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6); // Remove "data: " prefix
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }

    console.log("LLM response:", fullContent);
    return fullContent;
  }

  private updateStatus(partialStatus: Partial<SidecarStatus>) {
    this.status = { ...this.status, ...partialStatus };
    this.onStatusChange(this.status);
  }

  getStatus() {
    return this.status;
  }
}
