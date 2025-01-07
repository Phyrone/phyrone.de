import type { EnhancedImgAttributes } from '@sveltejs/enhanced-img';

export const images = import.meta.glob(
	[
		'/src/assets/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
		'/posts/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}'
	],
	{
		eager: true,
		import: 'default',
		query: {
			enhanced: true
		}
	}
);

export function get_image(path?: string, post?: string): EnhancedImgAttributes | undefined {
	if (!path) return undefined;
	if (!post) return images[path] as EnhancedImgAttributes | undefined;
	const absolute_img_path = new URL(path, 'file:' + post).pathname;
	return images[absolute_img_path] as EnhancedImgAttributes | undefined;
}
