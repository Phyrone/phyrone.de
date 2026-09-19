<script lang="ts">
	let { children, id } = $props();
</script>

<h4 class="mt-6 mb-2 scroll-mt-4 text-2xl font-bold sm:text-3xl" {id}>{@render children?.()}</h4>
