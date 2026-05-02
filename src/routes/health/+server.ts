import type { RequestHandler } from './$types';
import { text } from '@sveltejs/kit';

export const prerender = false;

export const GET: RequestHandler = async () => {
	return text('OK');
};
