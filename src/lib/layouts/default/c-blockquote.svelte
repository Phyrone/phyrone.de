<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};
	let { children }: Props = $props();
</script>

<blockquote
	class="border-base-content/20 bg-base-200 my-4 rounded-r-lg border-l-4 px-4 py-1 italic"
>
	{@render children?.()}
</blockquote>
