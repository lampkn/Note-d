export interface LLMMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface SidecarConfig {
	modelPath: string;
	port: number;
	contextLength: number;
}

export interface SidecarStatus {
	isRunning: boolean;
	pid?: number;
	output: string;
}
