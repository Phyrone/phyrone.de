<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
</script>

<MetaTags
	title="Samuel Laqua (Phyrone)"
	titleTemplate="%s"
	description="Persönliche Webseite und Blog von Samuel Laqua (Phyrone) – Informatikstudent an der HTWK Leipzig und Softwareentwickler."
	canonical="https://phyrone.de"
	openGraph={{
		type: 'website',
		url: 'https://phyrone.de',
		title: 'Samuel Laqua (Phyrone)',
		description:
			'Persönliche Webseite und Blog von Samuel Laqua (Phyrone) – Informatikstudent an der HTWK Leipzig und Softwareentwickler.',
		siteName: 'Phyrone',
		locale: 'de_DE'
	}}
/>

<JsonLd
	schema={[
		{
			'@type': 'WebSite',
			name: 'Phyrone',
			url: 'https://phyrone.de',
			description: 'Persönliche Webseite und Blog von Samuel Laqua (Phyrone)'
		},
		{
			'@type': 'Person',
			name: 'Samuel Laqua',
			alternateName: 'Phyrone',
			url: 'https://phyrone.de',
			jobTitle: 'Informatikstudent & Softwareentwickler',
			alumniOf: {
				'@type': 'CollegeOrUniversity',
				name: 'HTWK Leipzig',
				url: 'https://fim.htwk-leipzig.de/'
			},
			sameAs: [
				'https://github.com/phyrone',
				'https://mastodon.social/@phyrone',
				'https://bsky.app/profile/phyrone.bsky.social',
				'https://www.youtube.com/@phyrone'
			]
		}
	]}
/>

<h1 class={['text-6xl', 'font-jetbrains-mono']}>HI</h1>

<p class="font-jetbrains-mono wrap-break-words text-lg">
	{m['landing.hello']()}
	<a
		href="https://fim.htwk-leipzig.de/"
		class="link"
		target="_blank"
		rel="noopener noreferrer"
		aria-label="{m['landing.university-link']()} (öffnet in neuem Tab)"
	>
		{m['landing.university-link']()}
	</a>
</p>
