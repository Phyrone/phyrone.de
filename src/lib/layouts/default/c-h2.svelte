<script lang="ts">
	let { children, id } = $props();
</script>

<h2 class="text-5xl" {id}>{@render children?.()}</h2>
