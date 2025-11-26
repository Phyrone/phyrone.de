import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';
import { parse } from 'node-html-parser';
//import { available_themes, THEME_COOKIE_NAME } from '$lib/theme';
import { z } from 'zod';

const MINIFY_HTML = z.stringbool()
	.default(false)
	.catch(() => false)
	.parse(import.meta.env.VITE_MINIFY_HTML);

// creating a handle to use the paraglide middleware
export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(
		event.request,
		({ request: localizedRequest, locale }) => {
			event.request = localizedRequest;

			return resolve(event, {
				transformPageChunk: async ({ html }) => {
					let element = parse(html, {
						comment: true,
					});
					let html_element = element.querySelector("html");
					if (html_element) {
						html_element?.setAttribute("lang", locale);

						//let theme = event.cookies.get(THEME_COOKIE_NAME);
						//if (theme && available_themes.includes(theme)) {html_element.setAttribute('data-theme', theme);}
					}

					return html_element ? element.toString() : html;
				},
			});
		},
	);
