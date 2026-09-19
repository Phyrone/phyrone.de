<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};
	let { children }: Props = $props();
</script>

<ol class="my-4 list-decimal space-y-1 pl-6">
	{@render children?.()}
</ol>
