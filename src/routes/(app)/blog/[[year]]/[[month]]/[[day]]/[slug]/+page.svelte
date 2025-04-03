<script lang="ts">
	import type { PageData } from './$types';
	import { PageTransition } from 'ssgoi';
	import { get_image } from '$lib/images.ts';

	type Props = {
		data: PageData;
	};
	let { data }: Props = $props();

	let thumbnail = $derived(get_image(data.metadata.thumbnail, data.key));

</script>
<PageTransition>
	<div class="max-w-screen-lg" data-hero-key={'post::'+data.key}>
		<div  class="mx-auto">
			{#if thumbnail}
				<enhanced:img

					class="h-48 md:h-full w-fit max-w-64 rounded-lg md:rounded-none m-4 md:m-0 object-contain"
					src={thumbnail}
					alt="thumbnail for {data.metadata.slug}"
				/>
			{/if}
		</div>
		<data.post />
	</div>
</PageTransition>
