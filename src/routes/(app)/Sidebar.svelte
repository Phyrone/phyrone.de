<script lang="ts">
	import profile_img from '$assets/profile.png?enhanced';
	import { NewspaperIcon, PocketKnifeIcon } from 'lucide-svelte';
	import { siGithub, siMastodon, siYoutube, siBluesky } from 'simple-icons';
	import SimpleIcon from '$lib/SimpleIcon.svelte';
</script>

<div
	class={[
		['bg-blue-300', 'dark:bg-base-100'],
		[
			'flex-none',
			'sm:sticky',
			'sm:top-0',
			'sm:left-0',
			'sm:bottom-0',
			'sm:h-screen',
			'sm:rounded-r-md'
		],
		['flex', 'flex-col', 'p-3']
	]}
>
	<a
		href="/"
		class="mx-auto max-w-44 py-3 sm:w-48 sm:max-w-full sm:p-0 sm:p-3"
		title="Homepage"
		aria-label="go to homepage"
	>
		<enhanced:img
			class={[
				'h-fit w-fit',
				'rounded-lg',
				'transition-all',
				'drop-shadow-sm',
				'hover:drop-shadow-lg'
			]}
			src={profile_img}
			role="img"
			alt="profile"
		/>
	</a>
	<ul
		class="menu menu-xl w-full flex-auto menu-lg sm:menu-md sm:menu-vertical sm:overflow-auto px-0 max-w-sm mx-auto sm:mx-0">
		<li>
			<a href="/blog" title="Blog">
				<NewspaperIcon />
				Blog
			</a>
		</li>
		<li>
			<details>
				<summary>
					<PocketKnifeIcon />
					Utils
				</summary>
				<ul>
					<li>Comming Soon</li>
				</ul>
			</details>
		</li>
	</ul>
	<div class="join flex w-full max-w-sm mx-auto sm:mx-0">
		<a class="btn join-item flex-auto sm:btn-sm" href="https://github.com/phyrone" title="Github">
			<SimpleIcon icon={siGithub} />
		</a>
		<a class="btn join-item flex-auto sm:btn-sm" href="https://mastodon.social/@phyrone" title="Mastodon">
			<SimpleIcon icon={siMastodon} />
		</a>
		<a class="btn join-item flex-auto sm:btn-sm" href="https://bsky.app/profile/phyrone.bsky.social" title="Bluesky">
			<SimpleIcon icon={siBluesky} />
		</a>
		<a class="btn join-item flex-auto sm:btn-sm" href="https://www.youtube.com/@phyrone" title="Youtube">
			<SimpleIcon icon={siYoutube} />
		</a>
	</div>
</div>
