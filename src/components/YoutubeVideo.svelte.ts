import { persisted } from 'svelte-persisted-store';

export const show_youtube_accepted = persisted('pref:embedded:youtube:accepted', false, {
	storage: 'session',
	syncTabs: true
});
