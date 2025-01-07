<script lang="ts">
	import AppSkeleton from './(app)/AppSkeleton.svelte';
	import { page } from '$app/state';
</script>

<AppSkeleton>
	<div class="grid h-full w-full place-items-center">
		<div>
			<h1 class="font-pixelify-sans select-none text-4xl">{page.status}</h1>
			{#if page.error}
				<p class="select-nonefont-pixelify-sans text-2xl">{page.error.message}</p>
			{/if}
		</div>
	</div>
</AppSkeleton>
