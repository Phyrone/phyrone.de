<script lang="ts">
	let { children, id } = $props();
</script>

<h1 class="text-6xl" {id}>{@render children?.()}</h1>
