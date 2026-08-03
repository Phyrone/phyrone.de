<script lang="ts">
	import { EllipsisIcon, MenuIcon, PlusIcon } from '@lucide/svelte';
	//import ms from 'ms';
	import { PersistedState } from 'runed';
	const tooltip_interacted = new PersistedState('datatools:tooltip:interacted', false, {
		storage: 'local',
		syncTabs: true
	});
	let fab_open_btn: HTMLDivElement | null = $state(null);
	let fab_open = $state(false);

	//const keys = new PressedKeys();
	//TODO: make the shortcut platform specific (meta for mac, ctrl for windows/linux)
	//keys.onKeys(['shift', 'i'], () => {
	//	if (fab_open) fab_open_btn?.blur();
	//	else fab_open_btn?.focus();
	//});

	import { m } from '$paraglide/messages';

	$effect(() => {
		if (fab_open && !tooltip_interacted.current) tooltip_interacted.current = true;
	});
</script>

<div class="fab fab-flower">
	<div
		bind:this={fab_open_btn}
		bind:focused={fab_open}
		tabindex="0"
		role="button"
		class={[
			'btn btn-lg btn-circle btn-primary tooltip-left group',
			!fab_open && 'tooltip',
			!tooltip_interacted.current && 'tooltip-open'
		]}
		data-tip={m['utils.datatools.fab.open.tooltip']()}
	>
		<PlusIcon />
	</div>
	<button class="fab-main-action btn btn-circle btn-lg btn-success"><MenuIcon /></button>

	<button class="btn btn-lg btn-circle"><EllipsisIcon /></button>
	<button class="btn btn-lg btn-circle">B</button>
	<button class="btn btn-lg btn-circle">C</button>
	<button class="btn btn-lg btn-circle">D</button>
</div>
