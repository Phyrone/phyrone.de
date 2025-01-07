<script lang="ts">
	let { children, id } = $props();
</script>

<h5 class="text-xl" {id}>{@render children?.()}</h5>
