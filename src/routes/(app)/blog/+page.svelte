<script lang="ts">
	import 'shiki/themes/github-dark-default.mjs';
	//import type { PageData } from './$types';
	import BlogPostCard from './BlogPostCard.svelte';
	import { allPosts } from '$content';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	let posts = $derived([...allPosts].sort((a, b) => b.date.getTime() - a.date.getTime()));
</script>

<MetaTags
	title="Blog"
	titleTemplate="%s | Phyrone"
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
<div class={['flex', 'flex-col', 'gap-4']}>
	{#each posts as post (post._file)}
		<BlogPostCard {post} />
	{:else}
		<p class="opacity-70">Noch keine Beiträge vorhanden.</p>
	{/each}
</div>
