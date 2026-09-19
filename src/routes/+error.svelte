<script lang="ts">
	import AppSkeleton from './(app)/AppSkeleton.svelte';
	import { page } from '$app/state';
	import { MetaTags } from 'svelte-meta-tags';
</script>

<MetaTags title={`${page.status} - Fehler`} robots="noindex, nofollow" />

<AppSkeleton>
	<div class="grid h-full w-full place-items-center">
		<div>
			<h1 class="font-pixelify-sans text-4xl select-none">{page.status}</h1>
			{#if page.error}
				<p class="font-pixelify-sans text-2xl select-none">{page.error.message}</p>
			{/if}
		</div>
	</div>
</AppSkeleton>
