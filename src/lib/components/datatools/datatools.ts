import type { Component } from 'svelte';
import DtTextInput from './DtTextInput.svelte';

export type DtNodeType = 'text-input';

export const datatoolsNodeTypes: Record<DtNodeType, Component> = {
	'text-input': DtTextInput
};
