import type { SsgoiConfig } from '@ssgoi/svelte';
import { fade, hero, slide } from '@ssgoi/svelte/view-transitions';

export const transitions = {
	transitions: [
		{
			from: '/blog/',
			to: '/blog/*',
			transition: hero(),
			symmetric: true
		},
		{
			from: '/imprint/',
			to: '/privacy/',
			transition: slide({ direction: 'left' }),
			symmetric: false
		},
		{
			from: '/privacy/',
			to: '/imprint/',
			transition: slide({ direction: 'right' }),
			symmetric: false
		}
	]
} satisfies SsgoiConfig;
