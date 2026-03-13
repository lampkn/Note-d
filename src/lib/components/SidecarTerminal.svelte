<script lang="ts">
	interface Props {
		output: string;
	}

	let { output }: Props = $props();
</script>

<pre
	class="terminal"
	style="text-align: left; background: #111; color: #0f0; padding: 1rem; border-radius: 12px; margin-top: 1rem; max-height: 450px; overflow-y: auto; font-family: 'Fira Code', monospace; border: 1px solid #333; box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);"
>
	{output || "Waiting for sidecar output..."}
</pre>

<style>
	.terminal::-webkit-scrollbar {
		width: 8px;
	}
	.terminal::-webkit-scrollbar-track {
		background: #111;
	}
	.terminal::-webkit-scrollbar-thumb {
		background: #333;
		border-radius: 4px;
	}
	.terminal::-webkit-scrollbar-thumb:hover {
		background: #444;
	}
</style>
