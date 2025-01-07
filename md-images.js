// credit to pngwn doing majority of the plugin - https://github.com/pngwn/MDsveX/discussions/246#discussioncomment-720947
// @phyrone: credit to https://github.com/mattjennings/mdsvex-relative-images
// modified to make it work with enhanced

import { visit } from 'unist-util-visit';
import toCamel from 'just-camel-case';

const RE_SCRIPT_START =
	/<script(?:\s+?[a-zA-z]+(=(?:["']){0,1}[a-zA-Z0-9]+(?:["']){0,1}){0,1})*\s*?>/;
const RE_SRC = /src\s*=\s*"(.+?)"/;

export default function relativeImages() {
	return function transformer(tree) {
		const urls = new Map();
		const url_count = new Map();

		function transformUrl(url, useEnhanced = true) {
			url = decodeURIComponent(url);

			if (url.startsWith('.')) {
				// filenames can start with digits,
				// prepend underscore to guarantee valid module name
				let camel = `_${toCamel(url)}`;
				const count = url_count.get(camel);
				const dupe = urls.get(url);

				if (count && !dupe) {
					url_count.set(camel, count + 1);
					camel = `${camel}_${count}`;
				} else if (!dupe) {
					url_count.set(camel, 1);
				}

				urls.set(url, {
					path: url,
					id: camel,
					enhanced: useEnhanced
				});

				return `{${camel}}`;
			}

			return url;
		}

		// transform urls in images
		visit(tree, ['image', 'definition'], (node) => {
			node.url = transformUrl(node.url);
		});

		// transform src in html nodes
		visit(tree, 'html', (node) => {
			// only run on img or video elements. this is a cheap way to check it,
			// eventually we should integrate it into the RE_SRC regex.
			const isSupportedElement = node.value && node.value.match(/img|video/);
			const useEnhanced = node.value === 'img';

			if (isSupportedElement) {
				const [, url] = node.value.match(RE_SRC) ?? [];
				if (url) {
					const transformed = transformUrl(url, useEnhanced);
					node.value = node.value.replace(`"${url}"`, transformed);
				}
			}
		});

		let scripts = '';
		urls.forEach(
			(x) => (scripts += `import ${x.id} from "${x.path}${x.enhanced ? '?enhanced' : ''}";\n`)
		);

		let is_script = false;

		visit(tree, 'html', (node) => {
			if (RE_SCRIPT_START.test(node.value)) {
				is_script = true;
				node.value = node.value.replace(RE_SCRIPT_START, (script) => {
					return `${script}\n${scripts}`;
				});
			}
		});

		if (!is_script) {
			tree.children.push({
				type: 'html',
				value: `<script>\n${scripts}</script>`
			});
		}
	};
}
