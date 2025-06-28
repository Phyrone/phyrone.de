<script lang="ts">
	import 'shiki/themes/github-dark-default.mjs';
	import type { PageData } from './$types';
	import BlogPostCard from './BlogPostCard.svelte';

	type Props = {
		data: PageData;
	};
	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Phyrone | Blog</title>
</svelte:head>
<h1 class={['text-6xl', 'mb-4', 'font-jetbrains-mono', 'select-none']}>Blog</h1>
<div class={['flex', 'flex-col']}>
	{#each data.posts as post}
		<BlogPostCard {post} />
	{/each}
</div>
