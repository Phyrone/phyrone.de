<script lang="ts">
	import type { PostData } from '../+layout.ts';
	import { get_image } from '$lib/images.ts';
	import moment from 'moment/min/moment-with-locales';
	import { getLocale } from '$paraglide/runtime';

	type Props = {
		post: PostData;
	};

	let { post }: Props = $props();
	let thumbnail = $derived(get_image(post.metadata.thumbnail, post.key));

	let href = $derived(post.url);
</script>

<a
	{href}
	class={[
		'group card bg-base-200 drop-shadow-md transition-all ',
		'md:card-side hover:drop-shadow-sm md:h-44'
	]}
>
	{#if thumbnail}
		<figure class="">
			<enhanced:img
				class={[
					'm-4 h-48 w-fit max-w-64 rounded-lg object-contain',
					'md:m-0 md:h-full md:rounded-none md:transition-all md:duration-500 md:group-hover:scale-125'
				]}
				src={thumbnail}
				alt="thumbnail for {post.slug}"
			/>
		</figure>
	{/if}
	<div class="card-body">
		<h2 class="card-title truncate">{post.metadata.title ?? post.slug}</h2>
		{#if post.date}
			{@const moment_date = moment(post.date)}
			{@const localized_moment_date = moment_date.locale(getLocale())}
			<h3 class={['text-xs', 'truncate']} title={localized_moment_date.format('LLLL')}>
				<span>{localized_moment_date.format('LLLL')}</span>
			</h3>
		{/if}
		{#if post.metadata.description}
			<p class="truncate text-sm">{post.metadata.description}</p>
		{/if}
	</div>
</a>
