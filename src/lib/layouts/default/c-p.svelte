<script lang="ts">
	let { children } = $props();
</script>

<p class="my-4 leading-relaxed">{@render children?.()}</p>
