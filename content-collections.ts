import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';
import { defineParser } from '@content-collections/core';
import type { Moment, MomentFormatSpecification } from 'moment';
import moment from 'moment';
//import git from 'isomorphic-git';
//import fs from 'node:fs';
import type { Schema as CollectionsSchema } from '@content-collections/core';

const DATE_INPUT_FORMATS: MomentFormatSpecification = [
	'DD',
	'DD.MM',
	'DD.MM.YYYY',
	'DD.MM.YY',
	'DD.MM.YYYY-HH:mm',
	'DD.MM.YYYY HH:mm'
];

export const PostMetadata = z
	.object({
		slug: z.coerce.string(),
		title: z.coerce.string(),
		description: z.coerce.string(),
		date: z.coerce.string().transform((d) => moment(d, DATE_INPUT_FORMATS, 'de', true)),
		thumbnail: z.coerce.string(),
		tags: z.array(z.coerce.string())
	})
	.partial();

export type PostMetadata = z.infer<typeof PostMetadata>;
const ARTICLE_DATA_EXTRACT_PATTERN =
	/^(?:(?<year>\d{4})[-/](?:(?<month>[0-1]?\d)[-/](?:(?<day>[0-3]?\d)[-/])?)?)?(?:[a-zA-Z0-9][^/]+?\/)*?(?<slug>[a-zA-Z0-9][^/]+?)(?:\/index)?$/;

function parse_from_path(path: string): null | {
	year: number | undefined;
	month: number | undefined;
	day: number | undefined;
	slug: string | undefined;
} {
	const parsed = ARTICLE_DATA_EXTRACT_PATTERN.exec(path);

	if (parsed) {
		return {
			year: parsed.groups?.year ? parseInt(parsed.groups.year) : undefined,
			month: parsed.groups?.month ? parseInt(parsed.groups.month) : undefined,
			day: parsed.groups?.day ? parseInt(parsed.groups.day) : undefined,
			slug: parsed.groups?.slug
		};
	}

	return null;
}

async function date_if_blog_post(
	doc: CollectionsSchema<'frontmatter-only', typeof PostMetadata>,
	extract: ReturnType<typeof parse_from_path>
): Promise<Moment> {
	let date = doc.date ?? moment(new Date(0));
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
	transform: async (doc, ctx) => {
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
			tags: doc.tags,
			thumbnail: doc.thumbnail,
			title: doc.title ?? slug,
			_path: doc._meta
		};
	}
});

export default defineConfig({
	content: [posts]
});
