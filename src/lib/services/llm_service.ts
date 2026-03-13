import { Command } from "@tauri-apps/plugin-shell";
import type { LLMMessage, SidecarConfig, SidecarStatus } from "../types/llm";

export class LLMService {
	private status: SidecarStatus = {
		isRunning: false,
		output: ""
	};

	private onStatusChange: (status: SidecarStatus) => void;

	constructor(onStatusChange: (status: SidecarStatus) => void) {
		this.onStatusChange = onStatusChange;
	}

	async startSidecar(config: SidecarConfig) {
		this.updateStatus({ output: this.status.output + "Starting LLM sidecar...\n" });
		
		try {
			const command = Command.sidecar("binaries/llama-server", [
				"-m", config.modelPath,
				"--port", config.port.toString(),
				"-c", config.contextLength.toString(),
			]);

			const child = await command.spawn();
			this.updateStatus({ 
				isRunning: true, 
				pid: child.pid,
				output: this.status.output + `LLM Sidecar PID: ${child.pid}\n` 
			});

			command.stdout.on("data", (line: string) => {
				this.updateStatus({ output: this.status.output + `LLM: ${line}\n` });
			});

			command.stderr.on("data", (line: string) => {
				this.updateStatus({ output: this.status.output + `LLM Error: ${line}\n` });
			});

			return child;
		} catch (err) {
			const errorMsg = `Failed to start sidecar: ${err}\n`;
			this.updateStatus({ output: this.status.output + errorMsg });
			throw err;
		}
	}

	async sendMessage(message: string, port: number) {
		const response = await fetch(`http://localhost:${port}/completion`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: `1user\n${message}\n`,
				n_predict: 128,
				temperature: 0.7,
				stop: ["</s>"],
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		this.updateStatus({ output: this.status.output + `LLM: ${data.content}\n` });
		return data.content;
	}

	private updateStatus(partialStatus: Partial<SidecarStatus>) {
		this.status = { ...this.status, ...partialStatus };
		this.onStatusChange(this.status);
	}

	getStatus() {
		return this.status;
	}
}
