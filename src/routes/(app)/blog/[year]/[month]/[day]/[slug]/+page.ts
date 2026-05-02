import type { PageLoad } from './$types';
import { load_blog_post_component, pathIndexedPosts } from '$lib/posts.ts';
import { z } from 'zod';
import { error } from '@sveltejs/kit';

const Params = z.object({
	year: z.coerce.number().positive().int(),
	month: z.coerce.number().positive().min(1).max(12).int(),
	day: z.coerce.number().positive().min(1).max(31).int(),
	slug: z.string()
});
export const load: PageLoad = async ({ params }) => {
	const { year, month, day, slug } = await Params.parseAsync(params);
	const post = pathIndexedPosts[year][month][day][slug];
	if (!post) {
		error(404, 'post not found');
	}
	const content = await load_blog_post_component(post);

	if (!content) {
		error(500, 'something went wrong');
	}

	return {
		post,
		content
	};
};
