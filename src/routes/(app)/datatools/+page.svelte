<script lang="ts">
	//import { datatoolsNodeTypes } from '$lib/components/datatools/datatools';
	//import { SvelteFlow, MiniMap, Controls, Background, Panel } from '@xyflow/svelte';
	//import type { Node, Edge } from '@xyflow/svelte';
	//import '@xyflow/svelte/dist/style.css';
	//import { nanoid } from 'nanoid';
	//import AddNodeFAB from './AddNodeFAB.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { m } from '$lib/paraglide/messages';
	//import DataToolsMenu from './DataToolsMenu.svelte';

	//let nodes: Node[] = $state([]);
	//let edges: Edge[] = $state([]);
</script>

<MetaTags
	title={m['utils.datatools.page.title']()}
	titleTemplate="%s | Phyrone"
	description="Datatools und interaktive Datenwerkzeuge von Samuel Laqua."
	canonical="https://phyrone.de/datatools"
	openGraph={{
		type: 'website',
		url: 'https://phyrone.de/datatools',
		title: `${m['utils.datatools.page.title']()} | Phyrone`,
		description: 'Datatools und interaktive Datenwerkzeuge von Samuel Laqua.',
		siteName: 'Phyrone',
		locale: 'de_DE'
	}}
/>

<h1 class="font-jetbrains-mono mb-4 text-5xl font-bold">{m['utils.datatools.page.title']()}</h1>
<p class="font-jetbrains-mono text-lg opacity-80">
	Dieses Werkzeug befindet sich derzeit in Entwicklung.
</p>

<!-- 
<SvelteFlow colorMode="system" bind:nodes bind:edges fitView nodeTypes={datatoolsNodeTypes}>
	<MiniMap />
	<Controls />
	<Background />
	<Panel class="select-none" position="top-left">
		<h1 class="font-jetbrains-mono font-semibold opacity-50">Datatools</h1>
	</Panel>
	<Panel position="top-center">
		<DataToolsMenu />
	</Panel>
</SvelteFlow>

<AddNodeFAB />
-->
