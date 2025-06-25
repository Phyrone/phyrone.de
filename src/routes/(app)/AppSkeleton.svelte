<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import * as m from '$lib/paraglide/messages';
	import { onNavigate } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';

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
		<dev class="flex-auto">
			{@render children?.()}
		</dev>
		<footer class="bottom-0 flex-none">
			<a href={localizeHref("/impressum")} class="btn btn-link">{m.imprint()}</a>
			<a href={localizeHref("/datenschutz")} class="btn btn-link">{m.privacy_policy()}</a>
		</footer>
	</div>
</div>
