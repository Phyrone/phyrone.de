import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';

export const ssr = true;
export const prerender = true;
export const trailingSlash = 'never';

export const load: LayoutLoad = async () => {
	if (browser) {
		const { Observer } = await import('tailwindcss-intersect');
		Observer.start();
	}

	return {};
};
