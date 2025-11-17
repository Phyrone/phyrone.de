<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/state';
	import NavigatingIndicator from './NavigatingIndicator.svelte';

	let { children } = $props();
</script>

{#if navigating.type}
	<NavigatingIndicator />
{/if}

{@render children()}

