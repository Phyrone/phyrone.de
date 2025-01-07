<script lang="ts">
	let { children, id } = $props();
</script>

<h5 class="text-2xl" {id}>{@render children?.()}</h5>
