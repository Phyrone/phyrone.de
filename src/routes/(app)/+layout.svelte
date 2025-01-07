<script lang="ts">
	import AppSkeleton from './AppSkeleton.svelte';

	let { children } = $props();
</script>

<AppSkeleton>
	{@render children()}
</AppSkeleton>
