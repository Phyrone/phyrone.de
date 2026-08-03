import type { Picture } from 'vite-imagetools';

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

export function get_image(path?: string, post?: string): Picture | undefined {
	if (!path) return undefined;
	if (!post) return images[path] as Picture | undefined;
	const absolute_img_path = new URL(path, 'file:' + '/posts/' + post).pathname;
	return images[absolute_img_path] as Picture | undefined;
}
