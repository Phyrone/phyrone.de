#!/usr/bin/env node
/**
 * Fails if the build output loads a script, stylesheet, font or image from a
 * host we do not control.
 *
 * Hyperlinks are deliberately NOT matched — linking out is fine, loading from
 * outside is not. Only resource-loading positions are checked: <script src>,
 * <link href>, and CSS url(). The click-gated <iframe src> for YouTube is
 * likewise out of scope; it is governed by the CSP's frame-src instead.
 *
 * This exists because a CSP alone surfaces a violation as a broken page in
 * production, after deploy. This catches it at build time and names the file.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = '.svelte-kit/cloudflare';
const SCANNED = new Set(['.html', '.css', '.js']);

const ALLOWED = [/^https?:\/\/(?:[a-z0-9-]+\.)*phyrone\.de(?:[/:?#]|$)/i];

const PATTERNS = [
	/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi,
	/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi,
	/url\(\s*["']?([^"')]+)["']?\s*\)/gi
];

if (!existsSync(ROOT)) {
	console.error(`Build output not found at ${ROOT}. Run \`pnpm build\` first.`);
	process.exit(1);
}

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) yield* walk(full);
		else yield full;
	}
}

const violations = [];

for (const file of walk(ROOT)) {
	if (!SCANNED.has(extname(file))) continue;
	const source = readFileSync(file, 'utf8');
	for (const pattern of PATTERNS) {
		pattern.lastIndex = 0;
		let match;
		while ((match = pattern.exec(source)) !== null) {
			const url = match[1];
			if (!/^https?:\/\//i.test(url)) continue;
			if (ALLOWED.some((allowed) => allowed.test(url))) continue;
			violations.push(`${file}: ${url}`);
		}
	}
}

if (violations.length > 0) {
	console.error('External origins found in build output:\n');
	for (const violation of violations) console.error('  ' + violation);
	console.error(
		'\nThis site must not load scripts, assets or data from an external CDN.' +
			'\nBundle the dependency from node_modules instead.'
	);
	process.exit(1);
}

console.log('No external origins in build output.');
