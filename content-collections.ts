import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';
import dayjs, { type Dayjs } from 'dayjs';
import { parse_post_date, parse_from_path } from './src/lib/post-meta.ts';
import type { Schema as CollectionsSchema } from '@content-collections/core';

export const PostMetadata = z
	.object({
		slug: z.coerce.string(),
		title: z.coerce.string(),
		description: z.coerce.string(),
		date: z.coerce.string().transform((d) => parse_post_date(d)),
		thumbnail: z.coerce.string(),
		tags: z.array(z.coerce.string())
	})
	.partial();

export type PostMetadata = z.infer<typeof PostMetadata>;

async function date_if_blog_post(
	doc: CollectionsSchema<'frontmatter-only', typeof PostMetadata>,
	extract: ReturnType<typeof parse_from_path>
): Promise<Dayjs> {
	let date = doc.date ?? dayjs(0);

	if (extract?.year && extract?.month && extract?.day) {
		return dayjs(new Date(extract.year, extract.month - 1, extract.day));
	}
	if (extract?.year) {
		date = date.year(extract.year);
	}
	if (extract?.month) {
		date = date.month(extract.month - 1);
	}
	if (extract?.day) {
		date = date.date(extract.day);
	}

	return date;
}

const posts = defineCollection({
	name: 'posts',
	directory: 'posts',
	parser: 'frontmatter-only',
	include: '**/*.md',
	schema: PostMetadata,
	transform: async (doc: CollectionsSchema<'frontmatter-only', typeof PostMetadata>) => {
		const extract = parse_from_path(doc._meta.path);

		const slug = doc.slug ?? extract?.slug ?? doc._meta.fileName;
		const date = (await date_if_blog_post(doc, extract)).toDate();
		const id = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${slug}`;

		return {
			_file: doc._meta.filePath,
			_id: id,
			slug,
			date,
			description: doc.description,
			tags: doc.tags ?? [],
			thumbnail: doc.thumbnail,
			title: doc.title ?? slug,
			_path: doc._meta
		};
	}
});

export default defineConfig({
	content: [posts]
});
