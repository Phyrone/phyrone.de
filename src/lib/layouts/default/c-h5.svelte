<script lang="ts">
	let { children, id } = $props();
</script>

<h5 class="mt-4 mb-1 scroll-mt-4 text-xl font-bold sm:text-2xl" {id}>{@render children?.()}</h5>
