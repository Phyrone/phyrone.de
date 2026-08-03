import { resolve } from '$app/paths';
import type { Component } from 'svelte';
import { allPosts } from '$content';
import type { Post } from '$content';

export const blog_post_components = import.meta.glob('/posts/**/*.{svx,md}', {
	eager: false,
	import: 'default'
});

export async function load_blog_post_component(post: Post): Promise<Component | undefined> {
	const path = '/posts/' + post._file;
	return blog_post_components[path]?.() as unknown as Component | undefined;
}

export function post_to_url(post: Post): string {
	const y = post.date?.getFullYear();
	const m = post.date.getMonth() + 1;
	const d = post.date.getDate();
	const s = post.slug;
	return resolve('/(app)/blog/[year]/[month]/[day]/[slug]', {
		year: y.toString().padStart(4, '0'),
		month: m.toString().padStart(2, '0'),
		day: d.toString().padStart(2, '0'),
		slug: s
	});
}

export type PathIndexPosts = Record<number, Record<number, Record<number, Record<string, Post>>>>;

function index_posts() {
	const posts: PathIndexPosts = {};
	for (const post of allPosts) {
		const y = post.date?.getFullYear() ?? 0;
		const m = post.date ? post.date.getMonth() + 1 : 0;
		const d = post.date ? post.date.getDate() : 0;
		const s = post.slug;
		posts[y] ??= {};
		posts[y][m] ??= {};
		posts[y][m][d] ??= {};
		posts[y][m][d][s] = post;
	}
	return posts;
}

export const pathIndexedPosts = index_posts();
