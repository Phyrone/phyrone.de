import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { parse_post_date, parse_from_path } from './post-meta.ts';

describe('parse_post_date', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 7, 3, 12, 0, 0));
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('parses the padded German format used by real post frontmatter', () => {
		const d = parse_post_date('04.01.2025 12:00:00');
		expect(d.isValid()).toBe(true);
		expect([d.year(), d.month() + 1, d.date(), d.hour(), d.minute(), d.second()]).toEqual([
			2025, 1, 4, 12, 0, 0
		]);
	});

	it('parses a date without a time', () => {
		const d = parse_post_date('04.01.2024');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2024, 1, 4]);
	});

	it('parses ISO-style and dotted year-first formats', () => {
		for (const input of ['2024-01-04', '2024.01.04', '2024-1-4']) {
			const d = parse_post_date(input);
			expect([input, d.year(), d.month() + 1, d.date()]).toEqual([input, 2024, 1, 4]);
		}
	});

	it('parses unpadded day and month', () => {
		const d = parse_post_date('4.1.2024');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2024, 1, 4]);
	});

	it('parses an unpadded date with an unpadded time', () => {
		const d = parse_post_date('4.1.2024 9:05');
		expect([d.year(), d.month() + 1, d.date(), d.hour(), d.minute()]).toEqual([2024, 1, 4, 9, 5]);
	});

	it('parses a two-digit year', () => {
		const d = parse_post_date('04.01.24');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2024, 1, 4]);
	});

	it('parses the dash-separated time variant', () => {
		const d = parse_post_date('04.01.2024-13:45');
		expect([d.year(), d.month() + 1, d.date(), d.hour(), d.minute()]).toEqual([2024, 1, 4, 13, 45]);
	});

	it('fills a missing year and month from today', () => {
		const d = parse_post_date('15');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2026, 8, 15]);
	});

	it('fills a missing year from today', () => {
		const d = parse_post_date('04.03');
		expect([d.year(), d.month() + 1, d.date()]).toEqual([2026, 3, 4]);
	});

	it('does not let the bare day format swallow a full date', () => {
		// Regression guard: with 'D' ordered first, dayjs matched only the
		// leading "04" and returned today instead of 2024-01-04.
		const d = parse_post_date('04.01.2024');
		expect(d.year()).not.toBe(2026);
	});

	it('rejects unparseable input', () => {
		expect(parse_post_date('garbage').isValid()).toBe(false);
		expect(parse_post_date('').isValid()).toBe(false);
	});

	it('rejects an out-of-range month', () => {
		expect(parse_post_date('01.13.2024').isValid()).toBe(false);
	});

	it('rejects an out-of-range day instead of reinterpreting it as a year', () => {
		// moment returned 2032-01-19 here. Rejecting is the correct behavior.
		expect(parse_post_date('32.01.2024').isValid()).toBe(false);
	});
});

describe('parse_from_path', () => {
	it('extracts year and slug from a year-only path', () => {
		expect(parse_from_path('2024/test')).toEqual({
			year: 2024,
			month: undefined,
			day: undefined,
			slug: 'test'
		});
	});

	it('extracts a full year/month/day path', () => {
		expect(parse_from_path('2024/01/04/my-post')).toEqual({
			year: 2024,
			month: 1,
			day: 4,
			slug: 'my-post'
		});
	});

	it('extracts year and month when the day is absent', () => {
		expect(parse_from_path('2024/01/my-post')).toEqual({
			year: 2024,
			month: 1,
			day: undefined,
			slug: 'my-post'
		});
	});

	it('extracts a bare slug with no date parts', () => {
		expect(parse_from_path('just-a-slug')).toEqual({
			year: undefined,
			month: undefined,
			day: undefined,
			slug: 'just-a-slug'
		});
	});

	it('takes the last segment as the slug for nested paths', () => {
		expect(parse_from_path('nested/dir/post')?.slug).toBe('post');
	});

	it('takes the last segment as the slug under a dated path', () => {
		expect(parse_from_path('2024/01/04/deep/post')).toEqual({
			year: 2024,
			month: 1,
			day: 4,
			slug: 'post'
		});
	});
});
