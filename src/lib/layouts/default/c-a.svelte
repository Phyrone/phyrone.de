<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		href: string;
	};
	let { children, href }: Props = $props();
</script>

<a {href} class="link">
	{@render children?.()}
</a>
