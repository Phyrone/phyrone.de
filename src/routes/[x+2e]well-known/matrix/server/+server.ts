import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async () => {
	return json({
		'm.server': 'matrix.phyrone.de:443'
	});
};
