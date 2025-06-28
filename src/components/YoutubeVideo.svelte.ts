import { persisted } from 'svelte-persisted-store';
import { browser } from '$app/environment';
import { readable } from 'svelte/store';

export const show_youtube_accepted = persisted('pref:embedded:youtube:accepted', false, {
	storage: 'session',
	syncTabs: true
});
