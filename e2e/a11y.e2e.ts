import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
	{ name: 'Home', path: '/' },
	{ name: 'Blog Index', path: '/blog' },
	{ name: 'Blog Post', path: '/blog/2024/01/04/test' },
	{ name: 'Datatools', path: '/datatools' },
	{ name: 'Datenschutz', path: '/datenschutz' },
	{ name: 'Impressum', path: '/impressum' }
];

test.describe('Accessibility (a11y)', () => {
	for (const route of routes) {
		test(`${route.name} (${route.path}) should have 0 a11y violations`, async ({ page }) => {
			await page.goto(route.path);
			await page.waitForLoadState('domcontentloaded');

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
			expect(accessibilityScanResults.violations).toEqual([]);
		});
	}

	test('Skip to content link should be functional and keyboard accessible', async ({ page }) => {
		await page.goto('/');

		const skipLink = page.getByRole('link', { name: 'Zum Hauptinhalt springen' });
		await expect(skipLink).toHaveAttribute('href', '#main-content');

		// Initially visually hidden via sr-only class
		await expect(skipLink).toHaveClass(/sr-only/);

		// Focus skip link with Tab
		await page.keyboard.press('Tab');
		await expect(skipLink).toBeFocused();

		// Press Enter on skip link and verify main landmark is targeted
		await page.keyboard.press('Enter');
		const main = page.locator('#main-content');
		await expect(main).toBeAttached();
	});

	test('Navigation menu links should have visible focus style on focus-visible', async ({
		page
	}) => {
		await page.goto('/');
		const blogLink = page.getByRole('link', { name: 'Blog', exact: true });
		await blogLink.focus();
		await expect(blogLink).toBeFocused();
		// In src/app.css: .menu a:focus-visible has outline: 2px solid currentColor
		const outlineStyle = await blogLink.evaluate((el) => window.getComputedStyle(el).outlineStyle);
		expect(outlineStyle).toBe('solid');
	});
});
