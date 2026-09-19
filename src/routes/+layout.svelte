<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/state';
	import NavigatingIndicator from './NavigatingIndicator.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { children } = $props();
</script>

<MetaTags
	title="Samuel Laqua (Phyrone)"
	titleTemplate="%s | Phyrone"
	twitter={{
		cardType: 'summary_large_image',
		site: '@phyrone',
		creator: '@phyrone'
	}}
/>

{#if navigating.type}
	<NavigatingIndicator />
{/if}

{@render children()}
