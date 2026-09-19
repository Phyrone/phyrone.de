<script lang="ts">
	import type { PageData } from './$types';
	import { get_image } from '$lib/images.ts';
	import { MetaTags, JsonLd, type OpenGraph } from 'svelte-meta-tags';
	import { post_to_url } from '$lib/posts';
	import dayjs from '$lib/date.ts';
	import { getLocale } from '$paraglide/runtime';

	type Props = {
		data: PageData;
	};
	let { data }: Props = $props();
	let { post } = $derived(data);

	let thumbnail = $derived(get_image(post.thumbnail, post._file));
	let postUrl = $derived('https://phyrone.de' + post_to_url(post));
	let ogImage = $derived(thumbnail ? 'https://phyrone.de' + thumbnail.img.src : undefined);
	let localized_date = $derived(dayjs(post.date).locale(getLocale()));

	const opengraph = $derived({
		type: 'article',
		url: postUrl,
		title: post.title,
		description: post.description,
		article: {
			publishedTime: post.date.toISOString(),
			authors: ['Samuel Laqua'],
			tags: post.tags
		},
		images: ogImage
			? [
					{
						url: ogImage,
						alt: `Thumbnail für ${post.title}`
					}
				]
			: undefined,
		siteName: 'Phyrone',
		locale: 'de_DE'
	} satisfies OpenGraph);
</script>

<MetaTags
	title={post.title}
	titleTemplate="%s | Phyrone"
	description={post.description}
	keywords={post.tags}
	canonical={postUrl}
	openGraph={opengraph}
	twitter={{
		cardType: 'summary_large_image',
		title: post.title,
		description: post.description,
		image: ogImage,
		imageAlt: `Thumbnail für ${post.title}`
	}}
/>

<JsonLd
	schema={{
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description,
		datePublished: post.date.toISOString(),
		url: postUrl,
		author: {
			'@type': 'Person',
			name: 'Samuel Laqua',
			url: 'https://phyrone.de'
		},
		image: ogImage,
		keywords: post.tags?.join(', ')
	}}
/>

<div data-hero-key="post-body-{btoa(post._id)}" class="mx-auto max-w-3xl">
	{#if thumbnail}
		<div class="grid place-content-center" data-hero-key="post-thumbnail-{btoa(post._id)}">
			<enhanced:img
				class="m-4 h-48 w-fit max-w-64 rounded-lg object-contain md:m-0 md:h-full md:rounded-none"
				src={thumbnail}
				alt="thumbnail for {post.slug}"
			/>
		</div>
	{/if}
	<div data-hero-key="post-meta-{btoa(post._id)}">
		<h1 class="text-4xl font-bold sm:text-6xl">{post.title}</h1>
		<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-70">
			{#if post.date}
				<time datetime={post.date.toISOString()}>{localized_date.format('LL')}</time>
			{/if}
			{#if post.tags.length}
				<div class="flex flex-wrap gap-1">
					{#each post.tags as tag (tag)}
						<span class="badge badge-sm badge-ghost">{tag}</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	<div class="divider"></div>
	<article class="max-w-none" data-hero-key="post-content-{btoa(post._id)}">
		<data.content />
	</article>
</div>
