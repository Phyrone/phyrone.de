<svelte:options runes={true} />

<script module lang="ts">
	// Direct re-exports. `import x` followed by `export { x }` reads as an
	// assignment to an imported binding under eslint's no-import-assign.
	export { default as h1 } from './c-h1.svelte';
	export { default as h2 } from './c-h2.svelte';
	export { default as h3 } from './c-h3.svelte';
	export { default as h4 } from './c-h4.svelte';
	export { default as h5 } from './c-h5.svelte';
	export { default as h6 } from './c-h6.svelte';
	export { default as p } from './c-p.svelte';
	export { default as img } from './c-img.svelte';
	export { default as a } from './c-a.svelte';
</script>

<script lang="ts">
	//export let title: string;
	import type { Snippet } from 'svelte';
	type Props = {
		children?: Snippet;
	};
	let { children }: Props = $props();
</script>

<article>
	<!-- <slot /> -->
	{@render children?.()}
</article>
