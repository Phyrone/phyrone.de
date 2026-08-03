import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],

		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'.wrangler/',
			'src/lib/paraglide/',
			'.content-collections/'
		]
	},
	{
		rules: {
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			// Every occurrence in this project is a false positive: hrefs come
			// either from arbitrary post markdown (frequently external), from
			// paraglide's localizeHref, or from post_to_url — which already
			// calls resolve() internally, one level deeper than the rule sees.
			'svelte/no-navigation-without-resolve': 'off',
			// Underscore marks a binding that must exist positionally (snippet
			// parameters, destructured props) but is deliberately not used.
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			]
		}
	}
);
