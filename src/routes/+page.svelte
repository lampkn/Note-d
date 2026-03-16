<script lang="ts">
  import { LLMService } from "$lib/services/llm_service";
  import SidecarTerminal from "$lib/components/SidecarTerminal.svelte";
  import ChatInterface from "$lib/components/ChatInterface.svelte";
  import type { SidecarStatus } from "$lib/types/llm";
  import type { ChatMessage } from "$lib/types/llm";

  let status: SidecarStatus = $state({
    isRunning: false,
    output: "",
  });

  let chatMessages: ChatMessage[] = $state([]);
  let isChatLoading = $state(false);

  const llmService = new LLMService((newStatus: SidecarStatus) => {
    status = newStatus;
  });

  async function handleStartSidecar() {
    try {
      await llmService.startSidecar({
        modelPath: "../models/Qwen3-4B-Q4_K_M.gguf",
        port: 8080,
        contextLength: 4000,
      });
    } catch (err) {
      console.error("Failed to start sidecar:", err);
    }
  }

  async function handleSendMessage(message: string) {
    chatMessages = [...chatMessages, { role: "user", content: message }];
    isChatLoading = true;
    try {
      const response = await llmService.sendMessage(message, 8080);
      chatMessages = [
        ...chatMessages,
        { role: "assistant", content: response },
      ];
    } catch (err) {
      chatMessages = [
        ...chatMessages,
        {
          role: "assistant",
          content:
            "⚠️ Failed to get a response. Check the terminal for details.",
        },
      ];
      console.error("Failed to send message:", err);
    } finally {
      isChatLoading = false;
    }
  }
</script>

<main class="app">
  <header class="header">
    <h1>Note-d</h1>
    <p class="subtitle">Your AI-powered workspace</p>
    <div class="controls">
      <button
        type="button"
        class="start-button"
        onclick={handleStartSidecar}
        disabled={status.isRunning}
      >
        <span class="btn-dot" class:running={status.isRunning}></span>
        {status.isRunning ? "Sidecar Running" : "Start Qwen Sidecar"}
      </button>
    </div>
  </header>

  <div class="panels">
    <section class="panel terminal-panel">
      <div class="panel-header">
        <span class="panel-icon">⌨</span>
        <span>Terminal</span>
      </div>
      <SidecarTerminal output={status.output} />
    </section>

    <section class="panel chat-panel-wrapper">
      <div class="panel-header">
        <span class="panel-icon">💬</span>
        <span>Chat</span>
      </div>
      <ChatInterface
        isSidecarRunning={status.isRunning}
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        isLoading={isChatLoading}
      />
    </section>
  </div>
</main>

<style>
  :root {
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --bg-base: #0f0f1a;
    --bg-surface: #1a1a2e;
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --border-subtle: rgba(255, 255, 255, 0.06);
  }

  :global(body) {
    margin: 0;
    background: var(--bg-base);
    color: var(--text-main);
    font-family:
      "Inter",
      "Segoe UI",
      system-ui,
      -apple-system,
      sans-serif;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 1.5rem 2rem;
    gap: 1.25rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Header */
  .header {
    text-align: center;
    padding-bottom: 0.5rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0 0 1rem;
  }

  .controls {
    display: flex;
    justify-content: center;
  }

  .start-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.5rem;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: 12px;
    background: var(--primary);
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .start-button:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  }

  .start-button:disabled {
    background: #059669;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    cursor: default;
  }

  .btn-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transition: background 0.3s;
  }
  .btn-dot.running {
    background: #34d399;
    box-shadow: 0 0 6px #34d399;
    animation: pulse 2s infinite;
  }

  /* Panels */
  .panels {
    display: flex;
    width: 100%;
    gap: 1.25rem;
    flex: 1;
    min-height: 0;
  }

  .panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    max-height: calc(100vh - 180px);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-bottom: none;
    border-radius: 14px 14px 0 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .panel-icon {
    font-size: 0.9rem;
  }

  .terminal-panel :global(.terminal) {
    flex: 1;
    margin-top: 0 !important;
    border-radius: 0 0 14px 14px !important;
    max-height: none !important;
    min-height: 0;
  }

  .chat-panel-wrapper :global(.chat-panel) {
    flex: 1;
    border-radius: 0 0 14px 14px;
    min-height: 0;
  }

  /* Responsive */
  @media (max-width: 860px) {
    .panels {
      grid-template-columns: 1fr;
    }
    .panel {
      max-height: 45vh;
      min-height: 280px;
    }
    .app {
      padding: 1rem;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
