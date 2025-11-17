<script lang="ts">
	import type { PageData } from './$types';
	import { get_image } from '$lib/images.ts';
	import { SsgoiTransition } from '@ssgoi/svelte';

	type Props = {
		data: PageData;
	};
	let { data }: Props = $props();
	let title = $state('');

	let thumbnail = $derived(get_image(data.metadata.thumbnail, data.key));
</script>

<svelte:head>
	{#if title}
		<title>Phyrone | {title}</title>
	{:else}
		<title>Phyrone</title>
	{/if}
</svelte:head>

<SsgoiTransition id="/blog/{btoa(data.key)}">
	<div data-hero-key="post-body-{btoa(data.key)}" class="max-w-screen-lg">
		<div class="grid place-content-center" data-hero-key="post-thumbnail-{btoa(data.key)}">
			{#if thumbnail}
				<enhanced:img
					class="m-4 h-48 w-fit max-w-64 rounded-lg object-contain md:m-0 md:h-full md:rounded-none"
					src={thumbnail}
					alt="thumbnail for {data.metadata.slug}"
				/>
			{/if}
		</div>
		<div data-hero-key="post-meta-{btoa(data.key)}">
			<h1 class={['text-7xl', 'font-bold']}>{data.metadata.title ?? data.metadata.slug}</h1>
		</div>
		<div class="divider"></div>
		<main data-hero-key="post-body-{btoa(data.key)}">
			<data.post bind:title />
		</main>
	</div>
</SsgoiTransition>
