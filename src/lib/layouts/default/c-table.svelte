<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};
	let { children }: Props = $props();
</script>

<div class="my-4 overflow-x-auto">
	<table class="table">
		{@render children?.()}
	</table>
</div>
