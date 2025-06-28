import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as html_handle } from '$lib/server/server_html.ts';

export const handle: Handle = sequence(html_handle);
