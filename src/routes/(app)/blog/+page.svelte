<script lang="ts">
	import 'shiki/themes/github-dark-default.mjs';
	//import type { PageData } from './$types';
	import BlogPostCard from './BlogPostCard.svelte';
	import { allPosts } from '$content';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
</script>

<MetaTags
	title="Blog"
	description="Artikel über Softwareentwicklung, Informatik und Technik von Samuel Laqua (Phyrone)."
	canonical="https://phyrone.de/blog"
	openGraph={{
		type: 'website',
		url: 'https://phyrone.de/blog',
		title: 'Blog | Phyrone',
		description:
			'Artikel über Softwareentwicklung, Informatik und Technik von Samuel Laqua (Phyrone).',
		siteName: 'Phyrone',
		locale: 'de_DE'
	}}
/>

<JsonLd
	schema={{
		'@type': 'Blog',
		name: 'Phyrone Blog',
		description:
			'Artikel über Softwareentwicklung, Informatik und Technik von Samuel Laqua (Phyrone).',
		url: 'https://phyrone.de/blog'
	}}
/>

<h1 class={['text-6xl', 'mb-4', 'font-jetbrains-mono', 'select-none']}>Blog</h1>
<div class={['flex', 'flex-col']}>
	{#each allPosts as post (post._file)}
		<BlogPostCard {post} />
	{/each}
</div>
