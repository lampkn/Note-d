<script lang="ts">
	import type { ChatMessage } from "$lib/types/llm";

	interface Props {
		onSendMessage: (message: string) => Promise<void>;
		isSidecarRunning: boolean;
		messages: ChatMessage[];
		isLoading: boolean;
	}

	let { onSendMessage, isSidecarRunning, messages, isLoading }: Props = $props();
	let message = $state("");
	let messagesEnd: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (messages.length && messagesEnd) {
			messagesEnd.scrollIntoView({ behavior: "smooth" });
		}
	});

	async function handleSubmit() {
		if (!message.trim() || isLoading || !isSidecarRunning) return;
		const text = message;
		message = "";
		await onSendMessage(text);
	}
</script>

<div class="chat-panel">
	<div class="messages-area">
		{#if messages.length === 0}
			<div class="empty-state">
				<div class="empty-icon">💬</div>
				<p>No messages yet</p>
				<p class="empty-hint">Start a conversation with the model</p>
			</div>
		{:else}
			{#each messages as msg}
				<div class="message-row {msg.role}">
					<div class="avatar">{msg.role === "user" ? "You" : "AI"}</div>
					<div class="bubble {msg.role}">
						{msg.content}
					</div>
				</div>
			{/each}
			{#if isLoading}
				<div class="message-row assistant">
					<div class="avatar">AI</div>
					<div class="bubble assistant typing">
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
					</div>
				</div>
			{/if}
		{/if}
		<div bind:this={messagesEnd}></div>
	</div>

	<div class="input-area">
		<input
			type="text"
			placeholder={isSidecarRunning ? "Message Model..." : "Start sidecar to chat..."}
			bind:value={message}
			disabled={!isSidecarRunning || isLoading}
			onkeydown={(e) => e.key === "Enter" && handleSubmit()}
		/>
		<button
			type="button"
			onclick={handleSubmit}
			disabled={!isSidecarRunning || isLoading || !message.trim()}
		>
			{#if isLoading}
				<span class="send-icon spinning">⏳</span>
			{:else}
				<span class="send-icon">➤</span>
			{/if}
		</button>
	</div>
</div>

<style>
	.chat-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #1e1e2e;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.messages-area {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Scrollbar */
	.messages-area::-webkit-scrollbar { width: 6px; }
	.messages-area::-webkit-scrollbar-track { background: transparent; }
	.messages-area::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}
	.messages-area::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		color: #6b7280;
		gap: 0.25rem;
	}
	.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5; }
	.empty-state p { margin: 0; font-size: 0.95rem; }
	.empty-hint { font-size: 0.8rem !important; color: #4b5563; }

	/* Messages */
	.message-row {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		animation: fadeSlideIn 0.3s ease-out;
	}
	.message-row.user {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		flex-shrink: 0;
		letter-spacing: 0.03em;
	}
	.message-row.user .avatar {
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
	}
	.message-row.assistant .avatar {
		background: linear-gradient(135deg, #10b981, #059669);
		color: white;
	}

	.bubble {
		max-width: 75%;
		padding: 0.7rem 1rem;
		border-radius: 14px;
		font-size: 0.9rem;
		line-height: 1.55;
		word-wrap: break-word;
		white-space: pre-wrap;
	}
	.bubble.user {
		background: linear-gradient(135deg, #6366f1, #818cf8);
		color: white;
		border-bottom-right-radius: 4px;
	}
	.bubble.assistant {
		background: #2a2a3e;
		color: #e5e7eb;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-bottom-left-radius: 4px;
	}

	/* Typing indicator */
	.bubble.typing {
		display: flex;
		gap: 4px;
		align-items: center;
		padding: 0.8rem 1.2rem;
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #9ca3af;
		animation: bounce 1.2s infinite;
	}
	.dot:nth-child(2) { animation-delay: 0.15s; }
	.dot:nth-child(3) { animation-delay: 0.3s; }

	/* Input area */
	.input-area {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #16162a;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	input {
		flex: 1;
		padding: 0.7rem 1rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: #1e1e2e;
		color: #e5e7eb;
		font-size: 0.9rem;
		transition: all 0.2s;
		outline: none;
	}
	input::placeholder { color: #6b7280; }
	input:focus {
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
	}
	input:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	button {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	button:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
	}
	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.send-icon { font-size: 1.1rem; }
	.spinning { animation: spin 1s linear infinite; }

	/* Animations */
	@keyframes fadeSlideIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes bounce {
		0%, 60%, 100% { transform: translateY(0); }
		30% { transform: translateY(-5px); }
	}
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
