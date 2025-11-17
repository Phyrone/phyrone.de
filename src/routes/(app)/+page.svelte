<script lang="ts">
	import { m } from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>Phyrone</title>
</svelte:head>

<h1 class={['text-6xl', 'font-jetbrains-mono']}>HI</h1>

<p class="font-jetbrains-mono text-lg break-words">
	{m['landing.hello']()}
	<a href="https://fim.htwk-leipzig.de/" class="link">{m['landing.university-link']()}</a>
</p>

<!-- <h2 class={['text-3xl']}>{m['landing.favorite-programming-languages']()}</h2> -->
