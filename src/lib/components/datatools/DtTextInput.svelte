<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { TextareaAutosize } from 'runed';
	let { id, data }: NodeProps = $props();
	let { updateNodeData } = useSvelteFlow();
	let text_area_ref: HTMLTextAreaElement = $state(null!);
	let input_text = $state('');

	new TextareaAutosize({
		element: () => text_area_ref,
		input: () => input_text
	});
</script>

<div {id} class="text-updater-node bg-base-200 card px-2 py-4">
	<div>
		<textarea bind:this={text_area_ref} bind:value={input_text} class="textarea"></textarea>
	</div>
	<Handle type="source" position={Position.Bottom} />
</div>
