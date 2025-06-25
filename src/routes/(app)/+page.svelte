<script lang="ts">
	import { landing_text_hello_1, landing_text_university_link } from '$lib/paraglide/messages';

</script>
<svelte:head>
	<title>Phyrone</title>
</svelte:head>

<h1 class={['text-6xl','font-jetbrains-mono']}>
	HI
</h1>
<h2 class="text-lg font-jetbrains-mono break-words">
	{landing_text_hello_1()} <a href="https://fim.htwk-leipzig.de/" class="link">{landing_text_university_link()}</a>
</h2>
