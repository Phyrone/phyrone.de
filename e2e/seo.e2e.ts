import { test, expect } from '@playwright/test';

function extractSchemas(texts: (string | null)[]): Record<string, any>[] {
	const result: Record<string, any>[] = [];
	for (const text of texts) {
		if (!text) continue;
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) {
			result.push(...parsed);
		} else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
			result.push(...parsed['@graph']);
		} else {
			result.push(parsed);
		}
	}
	return result;
}

test.describe('SEO & Metadata', () => {
	test('Homepage has valid title, canonical, OpenGraph, and JSON-LD', async ({ page }) => {
		await page.goto('/');

		// Title & canonical
		await expect(page).toHaveTitle(/Samuel Laqua.*Phyrone/);
		const canonical = page.locator('link[rel="canonical"]');
		await expect(canonical).toHaveAttribute('href', 'https://phyrone.de');

		// OpenGraph
		const ogTitle = page.locator('meta[property="og:title"]');
		await expect(ogTitle).toHaveAttribute('content', /Samuel Laqua/);
		const ogUrl = page.locator('meta[property="og:url"]');
		await expect(ogUrl).toHaveAttribute('content', 'https://phyrone.de');

		// JSON-LD
		const jsonLdScripts = page.locator('script[type="application/ld+json"]');
		const count = await jsonLdScripts.count();
		expect(count).toBeGreaterThan(0);

		const rawTexts = await jsonLdScripts.allTextContents();
		const schemas = extractSchemas(rawTexts);

		const website = schemas.find((s) => s['@type'] === 'WebSite');
		expect(website).toBeDefined();
		expect(website?.name).toBe('Phyrone');

		const person = schemas.find((s) => s['@type'] === 'Person');
		expect(person).toBeDefined();
		expect(person?.name).toBe('Samuel Laqua');
	});

	test('Blog index has valid metadata and Blog schema', async ({ page }) => {
		await page.goto('/blog');

		await expect(page).toHaveTitle(/Blog \| Phyrone/);
		const canonical = page.locator('link[rel="canonical"]');
		await expect(canonical).toHaveAttribute('href', 'https://phyrone.de/blog');

		const jsonLdScripts = page.locator('script[type="application/ld+json"]');
		const count = await jsonLdScripts.count();
		expect(count).toBeGreaterThan(0);

		const rawTexts = await jsonLdScripts.allTextContents();
		const schemas = extractSchemas(rawTexts);
		const blogSchema = schemas.find((s) => s['@type'] === 'Blog');
		expect(blogSchema).toBeDefined();
		expect(blogSchema?.name).toBe('Phyrone Blog');
	});

	test('Blog post has normalized zero-padded canonical, article OG tags, and BlogPosting JSON-LD', async ({
		page
	}) => {
		await page.goto('/blog/2024/01/04/test');

		// Canonical must be zero-padded
		const canonical = page.locator('link[rel="canonical"]');
		await expect(canonical).toHaveAttribute('href', 'https://phyrone.de/blog/2024/01/04/test');

		// OG tags
		const ogType = page.locator('meta[property="og:type"]');
		await expect(ogType).toHaveAttribute('content', 'article');

		// JSON-LD BlogPosting
		const jsonLdScripts = page.locator('script[type="application/ld+json"]');
		const count = await jsonLdScripts.count();
		expect(count).toBeGreaterThan(0);

		const rawTexts = await jsonLdScripts.allTextContents();
		const schemas = extractSchemas(rawTexts);
		const postSchema = schemas.find((s) => s['@type'] === 'BlogPosting');
		expect(postSchema).toBeDefined();
		expect(postSchema?.headline).toBeTruthy();
		expect(postSchema?.datePublished).toContain('2024-01-04');
	});

	test('Error page contains noindex, nofollow robots tag', async ({ page }) => {
		await page.goto('/non-existent-page-404');
		const robots = page.locator('meta[name="robots"]');
		await expect(robots).toHaveAttribute('content', 'noindex, nofollow');
	});

	test('robots.txt exists and points to sitemap.xml', async ({ request }) => {
		const res = await request.get('/robots.txt');
		expect(res.status()).toBe(200);
		const text = await res.text();
		expect(text).toContain('Sitemap: https://phyrone.de/sitemap.xml');
	});

	test('sitemap.xml is valid XML and lists all main pages', async ({ request }) => {
		const res = await request.get('/sitemap.xml');
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('xml');
		const text = await res.text();
		expect(text).toContain('<urlset');
		expect(text).toContain('https://phyrone.de/');
		expect(text).toContain('https://phyrone.de/blog');
		expect(text).toContain('https://phyrone.de/blog/2024/01/04/test');
		expect(text).toContain('https://phyrone.de/datenschutz');
		expect(text).toContain('https://phyrone.de/impressum');
	});
});
