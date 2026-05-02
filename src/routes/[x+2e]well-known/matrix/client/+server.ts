import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async () => {
	return json({
		'm.homeserver': {
			base_url: 'https://matrix.phyrone.de'
		}
	});
};
