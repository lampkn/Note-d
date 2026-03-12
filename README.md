# Local-First Productivity AI

A blazingly fast, privacy-centric productivity application that combines your calendar, tasks, and notes with a powerful local LLM (Qwen 3 4B). 

Instead of sending your personal data to the cloud, this app runs entirely on your machine. Your AI "brain" reads your notes, understands your schedule, and helps you manage your day—all with zero latency and 100% offline capability.

## The Vision

Modern productivity apps force you to choose between smart AI features and data privacy. We are building the bridge. By leveraging optimized local models (like Qwen 3) and an embedded vector database, this app provides the contextual awareness of a cloud AI without your data ever leaving your hard drive.

### Core Features (In Development)
* **Local-First Architecture:** Everything is saved to a local SQLite database first. Fast, offline, and private.
* **Integrated Productivity:** A unified workspace featuring a calendar, task manager, and rich-text note editor.
* **Embedded AI Engine:** Runs `llama.cpp` as a background sidecar process to power a local LLM (target: Qwen 3 4B).
* **Retrieval-Augmented Generation (RAG):** Uses `sqlite-vec` to chunk and embed your notes, allowing the AI to instantly recall past ideas, summarize your schedule, and suggest actions based on your actual data.
* **Future-Proof Sync:** Designed with CRDTs (Conflict-free Replicated Data Types) in mind to eventually allow seamless, peer-to-peer or relay-based syncing with mobile devices.

## Tech Stack

**Frontend**
* **Framework:** Svelte 5 + Vite (Chosen for zero-overhead performance and tiny RAM footprint)
* **Language:** TypeScript
* **Styling:** *Tailwind CSS (Coming soon!)*

**Backend & AI**
* **Application Framework:** Tauri 2.0 (Rust)
* **Database:** SQLite (Local) + `sqlite-vec` for vector embeddings
* **AI Runtime:** `llama-server` (C++) bundled as a Tauri sidecar

## Getting Started (Development)

### Prerequisites
1. **Node.js** (v20+ recommended)
2. **pnpm** (`corepack enable pnpm`)
3. **Rust** (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
4. System-specific Tauri dependencies (WebKit/GTK for Linux/WSL).

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/productivity-ai.git](https://github.com/yourusername/productivity-ai.git)
   cd productivity-ai