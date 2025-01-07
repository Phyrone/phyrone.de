import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
//import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';
// @ts-ignore - Tailwind motion does not have typescript definitions (not dramatic but a bit annoying)
import motion from 'tailwindcss-motion';
import intersect from 'tailwindcss-intersect';

import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./svelte.config.js'
	],
	daisyui: {
		themes: ['light', 'dark']
	},
	theme: {
		extend: {}
	},

	plugins: [typography, /* forms,*/ containerQueries, aspectRatio, motion, intersect, daisyui]
} satisfies Config;
