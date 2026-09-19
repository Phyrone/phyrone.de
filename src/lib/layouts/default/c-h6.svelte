<script lang="ts">
	let { children, id } = $props();
</script>

<h6 class="mt-4 mb-1 scroll-mt-4 text-base font-semibold" {id}>{@render children?.()}</h6>
