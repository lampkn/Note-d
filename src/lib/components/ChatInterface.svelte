<script lang="ts">
	interface Props {
		onSendMessage: (message: string) => Promise<void>;
		isSidecarRunning: boolean;
	}

	let { onSendMessage, isSidecarRunning }: Props = $props();
	let message = $state("");
	let isLoading = $state(false);

	async function handleSubmit() {
		if (!message.trim() || isLoading || !isSidecarRunning) return;
		
		isLoading = true;
		try {
			await onSendMessage(message);
			message = "";
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="chat-interface">
	<input 
		type="text" 
		placeholder={isSidecarRunning ? "Message Model..." : "Start sidecar to chat..."}
		bind:value={message} 
		disabled={!isSidecarRunning || isLoading}
		onkeydown={(e) => e.key === 'Enter' && handleSubmit()}
	/>
	<button 
		type="button" 
		onclick={handleSubmit} 
		disabled={!isSidecarRunning || isLoading || !message.trim()}
	>
		{isLoading ? "Sending..." : "Send"}
	</button>
</div>

<style>
	.chat-interface {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
		width: 100%;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	input {
		flex: 1;
		padding: 0.8rem 1rem;
		border-radius: 10px;
		border: 1px solid #ddd;
		background: white;
		font-size: 1rem;
		transition: all 0.2s;
	}

	input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
		outline: none;
	}

	input:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
	}

	button {
		padding: 0.8rem 1.5rem;
		border-radius: 10px;
		background: #3b82f6;
		color: white;
		border: none;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	button:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
	}

	button:active:not(:disabled) {
		transform: translateY(0);
	}

	button:disabled {
		background: #93c5fd;
		cursor: not-allowed;
	}
</style>
