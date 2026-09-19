<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import * as m from '$lib/paraglide/messages';
	//import { onNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';

	type Props = {
		children?: Snippet;
	};
	let { children }: Props = $props();
</script>

<a
	href="#main-content"
	class="focus:bg-base-200 focus:text-base-content focus:outline-primary sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg focus:outline-2"
>
	Zum Hauptinhalt springen
</a>

<div class="relative flex flex-col sm:flex-row">
	<Sidebar />
	<div
		class={[
			'flex-auto',
			'sm:transition-all',
			'min-h-screen',
			'w-screen',
			'sm:w-full',
			'lg:max-w-5xl',
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
		<main id="main-content" class="flex-auto">
			{@render children?.()}
		</main>
		<footer class="bottom-0 flex flex-none flex-wrap items-center gap-2 py-2">
			<a
				data-hero-key="imprint"
				href={resolve('/(app)/impressum')}
				class="btn btn-link min-h-[44px]">{m.imprint()}</a
			>
			<a
				data-hero-key="privacy"
				href={resolve('/(app)/datenschutz')}
				class="btn btn-link min-h-[44px]">{m.privacy_policy()}</a
			>
		</footer>
	</div>
</div>
