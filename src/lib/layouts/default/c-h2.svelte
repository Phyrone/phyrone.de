<script lang="ts">
	let { children, id } = $props();
</script>

<h2 class="mt-8 mb-3 scroll-mt-4 text-4xl font-bold sm:text-5xl" {id}>{@render children?.()}</h2>
