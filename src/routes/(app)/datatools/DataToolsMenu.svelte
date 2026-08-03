<script lang="ts">
	import { Menubar } from 'bits-ui';
	import { CatIcon } from '@lucide/svelte';
	import { animate } from 'motion';

	let cat_spin = $state(false);
	function catClick(event: MouseEvent) {
		if (cat_spin) return;
		cat_spin = true;
		animate(
			event.currentTarget as HTMLButtonElement,
			{
				rotate: [0, 360]
			},
			{
				duration: 0.5
			}
		).then(() => {
			cat_spin = false;
		});
	}
</script>

<Menubar.Root class={['bg-base-100 rounded-lg px-2 py-1 shadow-sm']}>
	<div class="navbar-start">
		<div
			role="none"
			onclick={catClick}
			class="inline-flex aspect-square items-center justify-center text-center align-middle"
		>
			<CatIcon />
		</div>
		<Menubar.Menu>
			<Menubar.Trigger><button class="btn btn-xs btn-ghost">Nodes</button></Menubar.Trigger>
			<Menubar.Portal>
				<Menubar.Content class="bg-base-100 rounded-lg p-2 shadow">
					<Menubar.Item>
						<button class="btn btn-xs btn-ghost">Node 1</button>
					</Menubar.Item>
					<Menubar.Item>
						<button class="btn btn-xs btn-ghost">Node 2</button>
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Portal>
		</Menubar.Menu>
		<Menubar.Menu>
			<Menubar.Trigger><button class="btn btn-xs btn-ghost">Nodes</button></Menubar.Trigger>
			<Menubar.Portal>
				<Menubar.Content class="bg-base-100 rounded-lg p-2 shadow">
					<Menubar.Item>
						<button class="btn btn-xs btn-ghost">Node 1</button>
					</Menubar.Item>
					<Menubar.Item>
						<button class="btn btn-xs btn-ghost">Node 2</button>
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Portal>
		</Menubar.Menu>
	</div>
</Menubar.Root>
