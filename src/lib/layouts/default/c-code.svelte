<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};
	let { children }: Props = $props();
</script>

<code class="bg-base-300 rounded px-1.5 py-0.5 font-mono text-[0.9em]">
	{@render children?.()}
</code>
