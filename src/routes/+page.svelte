<script lang="ts">
  import { LLMService } from "$lib/services/llm_service";
  import SidecarTerminal from "$lib/components/SidecarTerminal.svelte";
  import ChatInterface from "$lib/components/ChatInterface.svelte";
  import type { SidecarStatus } from "$lib/types/llm";

  let status: SidecarStatus = $state({
    isRunning: false,
    output: "",
  });

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
    try {
      await llmService.sendMessage(message, 8080);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }
</script>

<main class="container">
  <header class="header">
    <h1>Note-d</h1>
    <p class="subtitle">Your AI-powered workspace</p>
  </header>

  <section class="controls">
    <button 
      type="button" 
      class="start-button"
      onclick={handleStartSidecar} 
      disabled={status.isRunning}
    >
      {status.isRunning ? "Sidecar Running" : "Start Qwen Sidecar"}
    </button>
  </section>

  <SidecarTerminal output={status.output} />

  <ChatInterface 
    isSidecarRunning={status.isRunning} 
    onSendMessage={handleSendMessage} 
  />
</main>

<style>
  :root {
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --bg-dark: #1a1a1a;
    --bg-light: #f9fafb;
    --text-main: #111827;
    --text-muted: #6b7280;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-main);
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 1.1rem;
  }

  .controls {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .start-button {
    padding: 0.8rem 2rem;
    font-weight: 600;
    border-radius: 12px;
    background: var(--primary);
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .start-button:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .start-button:disabled {
    background: #10b981; /* Green for running status */
    cursor: default;
    opacity: 0.8;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg-light: #111;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
    }
    
    .start-button:disabled {
      background: #059669;
    }
  }
</style>
