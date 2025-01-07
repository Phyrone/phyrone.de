<script lang="ts">
	let { children, id } = $props();
</script>

<h3 class="text-4xl" {id}>{@render children?.()}</h3>
