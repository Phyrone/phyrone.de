import type { RequestHandler } from '@sveltejs/kit';
import * as sitemap from 'super-sitemap/sveltekit';
import { allPosts } from '$content';

export const prerender = true;

export const GET: RequestHandler = async () => {
	return await sitemap.response({
		origin: 'https://phyrone.de',
		paramValues: {
			'/blog/[year]/[month]/[day]/[slug]': allPosts.map((post) => [
				post.date.getFullYear().toString().padStart(4, '0'),
				(post.date.getMonth() + 1).toString().padStart(2, '0'),
				post.date.getDate().toString().padStart(2, '0'),
				post.slug
			])
		}
	});
};
