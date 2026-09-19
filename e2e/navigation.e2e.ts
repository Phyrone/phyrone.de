import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
	test('Can navigate from home to blog to individual post and back', async ({ page }) => {
		await page.goto('/');

		// Click Blog in sidebar
		await page.getByRole('link', { name: 'Blog', exact: true }).click();
		await expect(page).toHaveURL(/\/blog$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();

		// Click on post card
		const postLink = page.locator('a[href*="/blog/2024/01/04/test"]').first();
		await postLink.click();
		await expect(page).toHaveURL(/\/blog\/2024\/01\/04\/test$/);
		await expect(page.locator('article[data-hero-key]').first()).toBeVisible();

		// Click profile avatar link to return to homepage
		await page.getByRole('link', { name: 'Zur Startseite' }).click();
		await expect(page).toHaveURL(/\/$/);
	});

	test('Can navigate to Datatools, Impressum, and Datenschutz', async ({ page }) => {
		await page.goto('/');

		// Footer links
		await page.getByRole('link', { name: 'Impressum' }).click();
		await expect(page).toHaveURL(/\/impressum$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Impressum' })).toBeVisible();

		await page.getByRole('link', { name: 'Datenschutzerklärung' }).click();
		await expect(page).toHaveURL(/\/datenschutz$/);
		await expect(
			page.getByRole('heading', { level: 1, name: 'Datenschutzerklärung' })
		).toBeVisible();

		// Sidebar Utils -> Datatools
		const utilsDetails = page.locator('details:has-text("Utils")');
		await utilsDetails.locator('summary').click();
		await page.getByRole('link', { name: 'Datatools' }).click();
		await expect(page).toHaveURL(/\/datatools$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Datatools' })).toBeVisible();
	});

	test('Social links have rel="noopener noreferrer" and target="_blank"', async ({ page }) => {
		await page.goto('/');

		const githubLink = page.getByRole('link', { name: /GitHub Profil/ });
		await expect(githubLink).toHaveAttribute('target', '_blank');
		await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
		await expect(githubLink).toHaveAttribute('href', 'https://github.com/phyrone');

		const mastodonLink = page.getByRole('link', { name: /Mastodon Profil/ });
		await expect(mastodonLink).toHaveAttribute('target', '_blank');
		await expect(mastodonLink).toHaveAttribute('rel', 'noopener noreferrer');
	});
});
