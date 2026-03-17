export interface LLMMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface ChatProcess extends LLMMessage {}

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

export interface ChatCompletionResponse {
	choices: {
		finish_reason: string;
		index: number;
		message: {
			role: string;
			content: string;
		};
	}[];
	model: string;
	id: string;
	created: number;
	object: string;
	usage: {
		completion_tokens: number;
		prompt_tokens: number;
		total_tokens: number;
	};
}
