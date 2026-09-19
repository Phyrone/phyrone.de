<script lang="ts">
	import profile_img from '$assets/profile.png?enhanced';
	import { DatabaseZapIcon, NewspaperIcon, PocketKnifeIcon } from '@lucide/svelte';
	import { siGithub, siMastodon, siYoutube, siBluesky } from 'simple-icons';
	import { resolve } from '$app/paths';
	import SimpleIcon from '$lib/SimpleIcon.svelte';
</script>

<aside
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
	aria-label="Seitenleiste"
>
	<a
		href={resolve('/(app)')}
		class="focus-visible:outline-primary flex h-12 w-12 items-center justify-center rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-2 sm:mx-auto sm:h-auto sm:w-48 sm:max-w-full sm:p-3"
		title="Homepage"
		aria-label="Zur Startseite"
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
			alt="Profilbild von Samuel Laqua"
		/>
	</a>
	<nav
		class="mx-auto w-full max-w-sm flex-auto px-0 sm:mx-0 sm:overflow-auto"
		aria-label="Hauptnavigation"
	>
		<ul class="menu menu-lg sm:menu-md sm:menu-vertical w-full px-0">
			<li>
				<a
					class="focus-visible:outline-primary min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2"
					href={resolve('/(app)/blog')}
					title="Blog"
				>
					<NewspaperIcon />
					Blog
				</a>
			</li>
			<li>
				<details>
					<summary
						class="focus-visible:outline-primary min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2"
					>
						<PocketKnifeIcon />
						Utils
					</summary>
					<ul>
						<li>
							<a
								class="focus-visible:outline-primary min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2"
								href={resolve('/(app)/datatools')}
							>
								<DatabaseZapIcon />
								Datatools
							</a>
						</li>
					</ul>
				</details>
			</li>
		</ul>
	</nav>
	<div class="join mx-auto flex w-full max-w-sm sm:mx-0">
		<a
			class={[
				'btn join-item sm:btn-sm min-h-[44px] flex-auto transition-all sm:min-h-8',
				'focus-visible:outline-primary hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
			]}
			href="https://github.com/phyrone"
			title="Github"
			aria-label="GitHub Profil von Phyrone (externer Link)"
			target="_blank"
			rel="noopener noreferrer"
		>
			<SimpleIcon icon={siGithub} />
		</a>
		<a
			class={[
				'btn join-item sm:btn-sm min-h-[44px] flex-auto transition-all sm:min-h-8',
				'focus-visible:outline-primary hover:bg-[#563ACC] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
			]}
			href="https://mastodon.social/@phyrone"
			title="Mastodon"
			aria-label="Mastodon Profil von Phyrone (externer Link)"
			target="_blank"
			rel="noopener noreferrer"
		>
			<SimpleIcon icon={siMastodon} />
		</a>
		<a
			class={[
				'btn join-item sm:btn-sm min-h-[44px] flex-auto transition-all sm:min-h-8',
				'focus-visible:outline-primary hover:bg-[#1285FE] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
			]}
			href="https://bsky.app/profile/phyrone.bsky.social"
			title="Bluesky"
			aria-label="Bluesky Profil von Phyrone (externer Link)"
			target="_blank"
			rel="noopener noreferrer"
		>
			<SimpleIcon icon={siBluesky} />
		</a>
		<a
			class={[
				'btn join-item sm:btn-sm min-h-[44px] flex-auto transition-all sm:min-h-8',
				'focus-visible:outline-primary hover:bg-[#ff0000] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2'
			]}
			href="https://www.youtube.com/@phyrone"
			title="Youtube"
			aria-label="YouTube Kanal von Phyrone (externer Link)"
			target="_blank"
			rel="noopener noreferrer"
		>
			<SimpleIcon icon={siYoutube} />
		</a>
	</div>
</aside>
