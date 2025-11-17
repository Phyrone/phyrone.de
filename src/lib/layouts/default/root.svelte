<svelte:options runes={true} />

<script module lang="ts">
	import h1 from './c-h1.svelte';
	import h2 from './c-h2.svelte';
	import h3 from './c-h3.svelte';
	import h4 from './c-h4.svelte';
	import h5 from './c-h5.svelte';
	import h6 from './c-h6.svelte';
	import p from './c-p.svelte';
	import img from './c-img.svelte';
	import a from './c-a.svelte';

	export { h1, h2, h3, h4, h5, h6, p, img, a };
</script>

<script lang="ts">
	//export let title: string;
	import type { Snippet } from 'svelte';
	type Props = {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>


<article>
	<!-- <slot /> -->
	{@render children?.()}
</article>
