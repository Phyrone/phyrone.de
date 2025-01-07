<script lang="ts">
	import { PlayIcon } from 'lucide-svelte';
	import { show_youtube_accepted } from './YoutubeVideo.svelte.ts';
	import * as m from '$lib/paraglide/messages';
	import { browser } from '$app/environment';

	type Props = {
		video: string;
	};
	let { video }: Props = $props();

	let height = 315;
	let width = 560;
</script>

{#if browser ? ($show_youtube_accepted) : false}
	<iframe
		{width}
		{height}
		src="https://www.youtube-nocookie.com/embed/{video}?modestbranding=1&rel=0&iv_load_policy=3"
		class="rounded-lg"
		title="YouTube video player"
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		referrerpolicy="strict-origin-when-cross-origin"
		allowfullscreen
	></iframe>
{:else}
	<div
		class={['grid', 'place-items-center', 'rounded-lg', 'bg-gray-900', 'text-white']}
		style:width={width + 'px'}
		style:height={height + 'px'}
	>
		<div class="flex flex-col">
			<button class="btn btn-primary" onclick={() => show_youtube_accepted.set(true)}>
				<PlayIcon />
				{m.show_youtube_video()}
			</button>
			<span class="text-center text-xs">
				Youtube:
				<a class="link" href="https://policies.google.com/privacy" target="_blank"
					>{m.privacy_policy()}</a
				>
			</span>
		</div>
	</div>
{/if}
