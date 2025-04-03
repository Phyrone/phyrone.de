<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import * as m from '$lib/paraglide/messages';
	import { onNavigate } from '$app/navigation';
	import transitions_config from './transitions';
	import { Ssgoi } from 'ssgoi';

	type Props = {
		children?: Snippet;
	};
	let { children }: Props = $props();
</script>

<div class="flex flex-col sm:flex-row">
	<Sidebar />
	<div
		class={[
			'flex-auto',
			'sm:transition-all',
			'min-h-screen',
			'w-screen',
			'sm:w-full',
			'lg:max-w-screen-lg',
			'overflow-clip',
			'py-2',
			'px-4',
			'sm:py-4',
			'sm:px-8',
			'relative',
			'flex',
			'flex-col',
			'bg-base-100',
			'sm:mx-2',
			'lg:mx-4'
		]}
	>
		<Ssgoi {onNavigate} config={transitions_config} class="flex-auto">
			{@render children?.()}
		</Ssgoi>
		<footer class="bottom-0 flex-none">
			<a href="/imprint" class="btn btn-link">{m.imprint()}</a>
			<a href="/privacy" class="btn btn-link">{m.privacy_policy()}</a>
		</footer>
	</div>
</div>
