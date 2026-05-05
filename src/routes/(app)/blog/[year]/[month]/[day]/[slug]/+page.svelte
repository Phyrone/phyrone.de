<script lang="ts">
	import type { PageData } from './$types';
	import { get_image } from '$lib/images.ts';
	import { MetaTags, type OpenGraph } from 'svelte-meta-tags';

	type Props = {
		data: PageData;
	};
	let { data }: Props = $props();
	let { post } = $derived(data);

	let thumbnail = $derived(get_image(post.thumbnail, post._file));

	const opengraph = $derived({
		title: post.title,
		description: post.description,
		article: {
			publishedTime: post.date.toISOString(),
			authors: ['Phyrone'],
			tags: post.tags
		}
	} satisfies OpenGraph);
</script>

<MetaTags
	title={post.title}
	description={post.description}
	keywords={post.tags}
	canonical={`https://phyrone.de/blog/${post.date.getFullYear()}/${post.date.getMonth() + 1}/${post.date.getDate()}/${post.slug}`}
	openGraph={opengraph}
/>

<div data-hero-key="post-body-{btoa(post._id)}" class="max-w-5xl">
	<div class="grid place-content-center" data-hero-key="post-thumbnail-{btoa(post._id)}">
		{#if thumbnail}
			<enhanced:img
				class="m-4 h-48 w-fit max-w-64 rounded-lg object-contain md:m-0 md:h-full md:rounded-none"
				src={thumbnail}
				alt="thumbnail for {post.slug}"
			/>
		{/if}
	</div>
	<div data-hero-key="post-meta-{btoa(post._id)}">
		<h1 class={['text-7xl', 'font-bold']}>{post.title}</h1>
	</div>
	<div class="divider"></div>
	<main data-hero-key="post-body-{btoa(post._id)}">
		<data.content />
	</main>
</div>
