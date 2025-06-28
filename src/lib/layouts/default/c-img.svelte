<script lang="ts">
	import { CircleXIcon, FileQuestion, RedoIcon, RefreshCcw } from 'lucide-svelte';
	import type { Picture } from 'vite-imagetools';

	type Props = {
		src: string | Picture;
		alt: string;
	};
	let { src, alt }: Props = $props();
</script>

{#snippet failed(error, reset)}
	<div class="skeleton grid aspect-video h-56 w-96 place-content-center">
		<button onclick={reset} class="btn btn-circle btn-error">
			<CircleXIcon />
		</button>
	</div>
{/snippet}

{#snippet unknown()}
	<div class="skeleton grid aspect-video h-56 w-96 place-content-center">
		<div>
			<FileQuestion />
		</div>
	</div>
{/snippet}

<svelte:boundary {failed}>
	{#if typeof src === 'string'}
		<img class="rounded-lg" {src} {alt} />
	{:else if typeof src === 'object'}
		<enhanced:img class="rounded-lg" {src} {alt} />
	{:else}
		{@render unknown()}
	{/if}
</svelte:boundary>
