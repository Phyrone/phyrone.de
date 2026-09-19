<script lang="ts">
	let { type = 'text', checked = false, disabled = false, ...restProps } = $props();
</script>

{#if type === 'checkbox'}
	<input
		type="checkbox"
		{checked}
		{disabled}
		aria-label={checked ? 'Erledigte Aufgabe' : 'Unerledigte Aufgabe'}
		class="checkbox checkbox-sm mr-2 inline-block align-middle"
		{...restProps}
	/>
{:else}
	<input {type} {checked} {disabled} {...restProps} />
{/if}
