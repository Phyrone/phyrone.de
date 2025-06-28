import { z } from 'zod';
import { resolveRoute } from '$app/paths';
import type { Component } from 'svelte';
/** @type {import('moment')} */
import moment from 'moment';
import type { MomentFormatSpecification } from 'moment';

const ARTICLE_DATA_EXTRACT_PATTERN =
	/^\/posts\/(?:(?<year>\d{4})[-/](?:(?<month>[0-1]?\d)[-/](?:(?<day>[0-3]?\d)[-/])?)?)?(?:[a-zA-Z0-9][^/]+?\/)*?(?<slug>[a-zA-Z0-9][^/]+?)(?:\/index)?.(?:svx|svelte\.md|md)$/;

const DATE_INPUT_FORMATS: MomentFormatSpecification = [
	'DD.MM.YYYY',
	'DD.MM.YY',
	'DD.MM.YYYY-HH:mm',
	'DD.MM.YYYY HH:mm'
];

export const PostMetadata = z
	.object({
		slug: z.string(),
		title: z.string(),
		description: z.string({ coerce: true }),
		date: z.string({ coerce: true }).transform((d) => moment(d, DATE_INPUT_FORMATS, 'de', true)),
		thumbnail: z.string({ coerce: true }),
		tags: z.array(z.string({ coerce: true }))
	})
	.partial();

export type PostMetadata = z.infer<typeof PostMetadata>;

export const post_documents = import.meta.glob('/posts/**/*.{svx,svelte.md}', {
	eager: false,
	import: 'default'
});
export const post_metadata = import.meta.glob('/posts/**/*.{svx,svelte.md}', {
	eager: false,
	import: 'metadata'
});

export type PostKeyNamed = {
	year: number | undefined;
	month: number | undefined;
	day: number | undefined;
	slug: string;
};

async function load_posts(): Promise<PostKvs> {
	const posts: PostKvs = {};
	const promises = [];

	for (const [path, metadata_promise] of Object.entries(post_metadata)) {
		const parse_promise = (async () => {
			const TIME_KEY = `[Posts] ${path} parse key`;
			try {
				console.time(TIME_KEY);
				const parsed = path.match(ARTICLE_DATA_EXTRACT_PATTERN);
				if (parsed && parsed.groups?.slug) {
					const data = {
						year: parsed.groups?.year ? parseInt(parsed.groups.year) : undefined,
						month: parsed.groups?.month ? parseInt(parsed.groups.month) : undefined,
						day: parsed.groups?.day ? parseInt(parsed.groups.day) : undefined,
						slug: parsed.groups?.slug
					} satisfies PostKeyNamed;

					const metadata_unsafe = await metadata_promise();
					const metadata_result = await PostMetadata.safeParseAsync(metadata_unsafe);
					if (metadata_result.data?.date) {
						//data.year = metadata_result.data.date.getFullYear();
						data.year = metadata_result.data.date?.year();
						data.month = metadata_result.data.date?.month() + 1;
						//data.month = metadata_result.data.date.getMonth() + 1;
						//data.day = metadata_result.data.date.getDate();
						data.day = metadata_result.data.date?.date();
					}
					if (metadata_result.data?.slug) {
						data.slug = metadata_result.data?.slug;
					}
					(((posts[data.year ?? 0] ??= {})[data.month ?? 0] ??= {})[data.day ?? 0] ??= {})[
						data.slug
					] = path;
				} else {
					console.warn('Failed to parse path', path);
				}
			} catch (e) {
				console.error('Failed to parse key', e);
			} finally {
				console.timeEnd(TIME_KEY);
			}
		})();
		promises.push(parse_promise);
	}
	await Promise.all(promises);
	//console.log('posts loaded', posts);
	return posts;
}

type PostKvs = Record<number, Record<number, Record<number, Record<string, string>>>>;

export const POSTS_KV_PROMISE: Promise<PostKvs> = load_posts();

export async function get_post_metadata(key: string): Promise<PostMetadata | undefined> {
	if (key) {
		const metadata_unsafe = await post_metadata[key]();
		const result = await PostMetadata.safeParseAsync(metadata_unsafe);
		return result.success ? result.data : undefined;
	} else {
		return undefined;
	}
}

const ParamsConstraints = z.object({
	y: z.number({ coerce: true }).positive().int().optional().catch(undefined),
	m: z.number({ coerce: true }).positive().int().optional().catch(undefined),
	d: z.number({ coerce: true }).positive().int().optional().catch(undefined),
	s: z.string()
});

export async function params_to_key(
	year: number | string | undefined,
	month: number | string | undefined,
	day: number | string | undefined,
	slug: string
): Promise<string | undefined> {
	const POSTS_KV = await POSTS_KV_PROMISE;
	const { y, m, d, s } = ParamsConstraints.parse({
		y: year,
		m: month,
		d: day,
		s: slug
	});

	return POSTS_KV[y ?? 0]?.[m ?? 0]?.[d ?? 0]?.[s];
}

export function get_post_url(
	year: number | string | undefined,
	month: number | string | undefined,
	day: number | string | undefined,
	slug: string
): string {
	const { y, m, d } = ParamsConstraints.parse({
		y: year,
		m: month,
		d: day,
		s: slug
	});

	return resolveRoute('/blog/[[year]]/[[month]]/[[day]]/[slug]', {
		year: y?.toString(),
		month: m?.toString(),
		day: d?.toString(),
		slug: slug
	});
}

export async function get_post(key: string): Promise<Component | undefined> {
	if (!key) return undefined;
	return (await post_documents[key]()) as unknown as Component;
}

//export const post_metadata = import.meta.glob('/src/posts/**/*.svx',{
//	eager:false,
//	import: 'metadata'
//});

export type Post = {
	slug: string;
	metadata: Record<string, any>;
};
