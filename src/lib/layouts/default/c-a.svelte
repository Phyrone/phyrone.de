<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		href: string;
	};
	let { children, href }: Props = $props();
</script>

<!-- href comes from arbitrary markdown in posts/ and is frequently external,
     so it cannot be routed through resolve(). -->
<a {href} class="link">
	{@render children?.()}
</a>
