<script lang="ts">
	import HLS from 'hls.js';
	import HLS_JS_WORKER from 'hls.js/dist/hls.worker.js?worker&url';
	import HlsQualitySelector from '$lib/components/HlsQualitySelector.svelte';

	type Props = {
		manifest: string;
		fallback?: string;
	};

	let { manifest, fallback }: Props = $props();
	let hls_controller: HLS | null = $state(null);

	function init_video(element: HTMLVideoElement & HTMLMediaElement) {
		if (HLS.isSupported())
			$effect(() => {
				const local_hls_controller = new HLS({
					autoStartLoad: true,
					lowLatencyMode: false,
					progressive: true,
					startLevel: -1,
					capLevelToPlayerSize: true,
					capLevelOnFPSDrop: true,
					abrMaxWithRealBitrate: true,
					enableWorker: true,
					workerPath: HLS_JS_WORKER
				});
				local_hls_controller.attachMedia(element);
				console.log('[HLS] Controller created and attached to video element');
				hls_controller = local_hls_controller;

				$effect(() => {
					const LOAD_SOURCE_TIME_KEY = `[HLS] Load source: ${manifest}`;
					try {
						console.time(LOAD_SOURCE_TIME_KEY);
						local_hls_controller.loadSource(manifest);
					} finally {
						console.timeEnd(LOAD_SOURCE_TIME_KEY);
					}
				});

				return () => {
					local_hls_controller.destroy();
					console.log('[HLS] Controller destroyed');
				};
			});
	}

	let width = $state(40);
</script>

<video
	class=""
	style:width={`${width}%`}
	height="100%"
	use:init_video
	controls
	crossorigin="anonymous"
>
	{#key manifest}
		<source src={manifest} type="application/vnd.apple.mpegurl" />
	{/key}
	{#if fallback}
		{#key fallback}
			<source src={fallback} type="video/mp4" />
		{/key}
	{/if}
</video>

<input type="range" min="0" max="100" bind:value={width} />
{width}%
{#if hls_controller}
	<HlsQualitySelector {hls_controller} />
{/if}
