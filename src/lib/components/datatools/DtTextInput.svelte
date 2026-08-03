<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { TextareaAutosize } from 'runed';
	// `data` and `updateNodeData` are scaffolding for the unfinished datatools
	// feature — kept deliberately, underscored to mark them as not yet wired up.
	let { id, data: _data }: NodeProps = $props();
	let { updateNodeData: _updateNodeData } = useSvelteFlow();
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
