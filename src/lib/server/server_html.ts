import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';
import { parse } from 'node-html-parser';
//import { available_themes, THEME_COOKIE_NAME } from '$lib/theme';
import { minify } from '@swc/html';

// creating a handle to use the paraglide middleware
export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;

		return resolve(event, {
			transformPageChunk: async ({ html }) => {
				let element = parse(html, {
					comment: true
				});
				let html_element = element.querySelector('html');
				if (html_element) {
					html_element?.setAttribute('lang', locale);

					//let theme = event.cookies.get(THEME_COOKIE_NAME);
					//if (theme && available_themes.includes(theme)) {html_element.setAttribute('data-theme', theme);}
				}
				let transformed1 = html_element ? element.toString() : html;
				const transformed2 = await minify(transformed1, {
					collapseWhitespaces: 'advanced-conservative',
					collapseBooleanAttributes: true,
					selfClosingVoidElements: true,
					removeRedundantAttributes: 'smart',
					removeComments: false
				});
				if (transformed2.errors) {
					console.error('Error while minifying HTML:', transformed2.errors);
					return transformed1;
				} else {
					return transformed2.code;
				}
			}
		});
	});
