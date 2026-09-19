<script lang="ts">
	let { children, id } = $props();
</script>

<h1 class="mt-8 mb-4 scroll-mt-4 text-5xl font-bold sm:text-6xl" {id}>{@render children?.()}</h1>
