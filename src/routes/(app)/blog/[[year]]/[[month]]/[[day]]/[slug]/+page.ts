import type { PageLoad } from './$types';
import { get_post, get_post_metadata, params_to_key } from '$lib/posts.ts';
import { z } from 'zod';
import { error } from '@sveltejs/kit';

const Params = z.object({
	year: z.number({ coerce: true }).positive().int().optional(),
	month: z.number({ coerce: true }).positive().min(1).max(12).int().optional(),
	day: z.number({ coerce: true }).positive().min(1).max(31).int().optional(),
	slug: z.string()
});
export const load: PageLoad = async ({ params }) => {
	const { year, month, day, slug } = await Params.parseAsync(params);
	const key = await params_to_key(year, month, day, slug);
	if (!key) {
		error(404, 'post not found');
	}
	const [post, metadata] = await Promise.all([get_post(key), get_post_metadata(key)]);
	if (!post || !metadata) {
		error(500, 'something went wrong');
	}

	return {
		key,
		post,
		metadata
	};
};
