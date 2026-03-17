import { Command } from "@tauri-apps/plugin-shell";
import type { LLMMessage, SidecarConfig, SidecarStatus, ChatCompletionResponse, ChatProcess } from "../types/llm";

export class LLMService {
  private status: SidecarStatus = {
    isRunning: false,
    output: "",
  };

  // Callback function to update the status of the sidecar
  private onStatusChange: (status: SidecarStatus) => void;

  constructor(onStatusChange: (status: SidecarStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  // Start the LLM sidecar
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

  // Send a message to the LLM sidecar
  async sendMessage(message: string, port: number): Promise<string> {
    try {
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
                content:
                  "You are a helpful, concise, and friendly AI assistant.",
              },
              {
                role: "user",
                content: message,
              },
            ],
          }),
        },
      );

      // New processMessage function that will be used for feedback loop and will deprecate sendMessage
      async processMessage(message: string, port: number): Promise<string> {
        
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatCompletionResponse = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      return content;
    } catch (err) {
      const errorMsg = `Failed to send message: ${err}\n`;
      this.updateStatus({ output: this.status.output + errorMsg });
      throw err;
    }
  }

  // Update the status of the sidecar
  private updateStatus(partialStatus: Partial<SidecarStatus>) {
    this.status = { ...this.status, ...partialStatus };
    this.onStatusChange(this.status);
  }

  // Get the status of the sidecar
  getStatus() {
    return this.status;
  }
}
