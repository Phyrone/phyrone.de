<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import { navigating } from '$app/state';
	import NavigatingIndicator from './NavigatingIndicator.svelte';

	let { children } = $props();

</script>

<ParaglideJS {i18n}>
	{#if navigating.type}
		<NavigatingIndicator />
	{/if}
	{@render children()}
</ParaglideJS>
