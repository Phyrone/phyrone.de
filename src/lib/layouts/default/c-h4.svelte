<script lang="ts">
	let { children, id } = $props();
</script>

<h4 class="text-3xl" {id}>{@render children?.()}</h4>
