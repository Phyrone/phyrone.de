import type { LayoutLoad } from "./$types";

import {
	get_post_metadata,
	get_post_url,
	type PostMetadata,
	POSTS_KV_PROMISE,
} from "$lib/posts.ts";
import { z } from "zod";

export type PostData = {
	slug: string;
	url: string;
	key: string;
	date?: Date;
	metadata: PostMetadata;
};

export const load: LayoutLoad = async function load() {
	const KVS = await POSTS_KV_PROMISE;
	const posts_futtures: Promise<PostData>[] = [];

	const FULL_DATE = z.object({
		y: z.number({ coerce: true }).positive().int(),
		m: z.number({ coerce: true }).positive().int(),
		d: z.number({ coerce: true }).positive().int(),
	});
	for (const year in KVS) {
		for (const month in KVS[year]) {
			for (const day in KVS[year][month]) {
				for (const [slug, key] of Object.entries(KVS[year][month][day])) {
					const future = (async () => {
						const metadata = (await get_post_metadata(key)) ?? {};
						const url = get_post_url(year, month, day, slug);

						const date = metadata.date ??
							await FULL_DATE.safeParseAsync({ y: year, m: month, d: day })
								.then((d) => d.data)
								.then((d) => d ? new Date(d.y, d.m - 1, d.d) : undefined);

						return { slug, key, url, metadata, date } satisfies PostData;
					})();
					posts_futtures.push(future);
				}
			}
		}
	}
	const posts = await Promise.all(posts_futtures);

	return {
		posts,
	};
};
