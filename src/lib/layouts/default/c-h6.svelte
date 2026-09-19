<script lang="ts">
	let { children, id } = $props();
</script>

<h6 class="text-base font-semibold" {id}>{@render children?.()}</h6>
