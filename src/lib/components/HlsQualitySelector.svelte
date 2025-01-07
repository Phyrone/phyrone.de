<script lang="ts">
	import Hls, { Events } from 'hls.js';
	import type {
		Level,
		ManifestParsedData,
		LevelsUpdatedData,
		LevelUpdatedData,
		LevelSwitchedData
	} from 'hls.js';

	type Props = {
		hls_controller: Hls;
	};
	let { hls_controller }: Props = $props();
	let levels: Level[] = $state([]);

	let current_level = $state(0);
	let selected_level = $state(0);
	let auto_level = $state(true);

	$effect(() => {
		if (auto_level) {
			hls_controller.nextLevel = -1;
		} else {
			hls_controller.nextLevel = selected_level;
		}
	});
	$effect(() => {
		if (auto_level) {
			selected_level = current_level;
		} else if (selected_level == -1) {
			selected_level = 0;
		} else if (selected_level >= levels.length) {
			selected_level = levels.length - 1;
		}
	});

	const HandleManifestParsed = (event: typeof Events.MANIFEST_PARSED, data: ManifestParsedData) => {
		console.debug('[Hls/Event]', event, data);
		levels = data.levels;
	};
	const HandleLevelsUpdated = (event: typeof Events.LEVELS_UPDATED, data: LevelsUpdatedData) => {
		console.debug('[Hls/Event]', event, data);
		levels = data.levels;
	};
	const HandleLevelUpdated = (event: typeof Events.LEVEL_UPDATED, data: LevelUpdatedData) => {
		console.debug('[Hls/Event]', event, data);
		levels[data.level].details = data.details;
	};
	const HandleLevelSwitched = (event: typeof Events.LEVEL_SWITCHED, data: LevelSwitchedData) => {
		console.debug('[Hls/Event]', event, data);
		current_level = data.level;
		auto_level = hls_controller.autoLevelEnabled;
	};

	$effect(() => {
		hls_controller.on(Events.MANIFEST_PARSED, HandleManifestParsed);
		hls_controller.on(Events.LEVELS_UPDATED, HandleLevelsUpdated);
		hls_controller.on(Events.LEVEL_UPDATED, HandleLevelUpdated);
		hls_controller.on(Events.LEVEL_SWITCHED, HandleLevelSwitched);
		levels = hls_controller.levels;
		current_level = hls_controller.currentLevel;
		auto_level = hls_controller.autoLevelEnabled;

		return () => {
			hls_controller.off(Hls.Events.MANIFEST_PARSED, HandleManifestParsed);
			hls_controller.off(Hls.Events.LEVELS_UPDATED, HandleLevelsUpdated);
			hls_controller.off(Hls.Events.LEVEL_UPDATED, HandleLevelUpdated);
			hls_controller.off(Hls.Events.LEVEL_SWITCHED, HandleLevelSwitched);
			levels = [];
		};
	});
	//let is_swtiching = $derived(selected_level != current_level);
</script>

{selected_level} vs {current_level}
<input class="checkbox" type="checkbox" bind:checked={auto_level} /> Auto

<span class="join">
	<select class="select" bind:value={selected_level} disabled={auto_level}>
		{#each levels as level, index}
			<option class="bg-green-400" value={index}>{level.height}p</option>
		{/each}
	</select>
</span>
