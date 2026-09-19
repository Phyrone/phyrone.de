<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		class?: string;
	};
	let { children, class: class_name = '' }: Props = $props();
</script>

<ul
	class={[
		'my-4 space-y-1',
		class_name.includes('contains-task-list') ? 'list-none pl-0' : 'list-disc pl-6'
	]}
>
	{@render children?.()}
</ul>
