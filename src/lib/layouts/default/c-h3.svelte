<script lang="ts">
	let { children, id } = $props();
</script>

<h3 class="mt-6 mb-2 scroll-mt-4 text-3xl font-bold sm:text-4xl" {id}>{@render children?.()}</h3>
