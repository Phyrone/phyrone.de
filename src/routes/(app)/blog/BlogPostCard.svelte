<script lang="ts">
	import type { PostData } from '../+layout.ts';
	import { get_image } from '$lib/images.ts';
	import moment from 'moment/min/moment-with-locales';
	import { languageTag } from '$lib/paraglide/runtime';
	import { PageTransition, transitions } from 'ssgoi';

	type Props = {
		post: PostData;
	};

	let { post }: Props = $props();
	let thumbnail = $derived(get_image(post.metadata.thumbnail, post.key));
</script>

<a  href={post.url} class="card md:card-side md:h-44 bg-base-200">
	{#if thumbnail}
		<figure data-hero-key={'post::'+post.key} class="">
			<enhanced:img
				class="h-48 md:h-full w-fit max-w-64 rounded-lg md:rounded-none m-4 md:m-0 object-contain"
				src={thumbnail}
				alt="thumbnail for {post.slug}"
			/>
		</figure>
	{/if}
	<div class="card-body">
		<h2 class="card-title truncate">{post.metadata.title ?? post.slug}</h2>
		{#if post.date}
			{@const moment_date = moment(post.date)}
			{@const localized_moment_date = moment_date.locale(languageTag())}
			<h3 class={['text-xs','truncate']}
					title={localized_moment_date.format('LLLL')}>
				<span>{localized_moment_date.format('LLLL')}</span>
			</h3>
		{/if}
		{#if post.metadata.description}
			<p class="text-sm truncate">{post.metadata.description}</p>
		{/if}
	</div>
</a>
