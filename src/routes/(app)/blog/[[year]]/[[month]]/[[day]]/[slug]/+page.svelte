<script lang="ts">
	import type { PageData } from './$types';
	import { get_image } from '$lib/images.ts';

	type Props = {
		data: PageData;
	};
	let { data }: Props = $props();

	let thumbnail = $derived(get_image(data.metadata.thumbnail, data.key));
</script>

<div class="max-w-screen-lg">
	<div class="grid place-content-center">
		{#if thumbnail}
			<enhanced:img
				class="m-4 h-48 w-fit max-w-64 rounded-lg object-contain md:m-0 md:h-full md:rounded-none"
				src={thumbnail}
				alt="thumbnail for {data.metadata.slug}"
			/>
		{/if}
	</div>
	<data.post />
</div>
