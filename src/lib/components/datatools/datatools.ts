import type { Component } from 'svelte';
import type { NodeProps } from '@xyflow/svelte';
import DtTextInput from './DtTextInput.svelte';

export type DtNodeType = 'text-input';

export const datatoolsNodeTypes: Record<DtNodeType, Component<NodeProps>> = {
	'text-input': DtTextInput
};
