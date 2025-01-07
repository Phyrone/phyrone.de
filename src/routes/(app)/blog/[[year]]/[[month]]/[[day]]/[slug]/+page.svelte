<script lang="ts">
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};
	let { data }: Props = $props();
</script>

<div class="max-w-screen-lg">
	<data.post />
</div>
