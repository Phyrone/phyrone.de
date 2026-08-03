import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

/**
 * Ordered most-specific first, with the bare day formats last.
 *
 * moment scored every format and picked the best match. dayjs returns the
 * FIRST format that parses, so a bare 'D' near the front would match only the
 * leading digits of a full date and silently discard the rest — turning
 * '04.01.2025 12:00:00' into today.
 *
 * Both zero-padded and unpadded variants are required because parsing is
 * strict: dayjs's 'D' rejects '04' and its 'DD' rejects '4'.
 */
export const DATE_INPUT_FORMATS = [
	'DD.MM.YYYY HH:mm:ss',
	'DD.MM.YYYY-HH:mm:ss',
	'D.M.YYYY H:mm:ss',
	'D.M.YYYY-H:mm:ss',
	'DD.MM.YYYY HH:mm',
	'DD.MM.YYYY-HH:mm',
	'D.M.YYYY H:mm',
	'D.M.YYYY-H:mm',
	'YYYY-MM-DD',
	'YYYY.MM.DD',
	'YYYY-M-D',
	'YYYY.M.D',
	'DD.MM.YYYY',
	'D.M.YYYY',
	'DD.MM.YY',
	'D.M.YY',
	'DD.MM',
	'D.M',
	'DD',
	'D'
];

/**
 * Parses a post date. Strict on purpose: in loose mode dayjs turns '4.1.2024'
 * into 2027-12-19 rather than failing, and a silently wrong date in a blog
 * archive is worse than a loud invalid one.
 */
export function parse_post_date(input: string): Dayjs {
	return dayjs(input, DATE_INPUT_FORMATS, true);
}

export const ARTICLE_DATA_EXTRACT_PATTERN =
	/^(?:(?<year>\d{4})[-/](?:(?<month>[0-1]?\d)[-/](?:(?<day>[0-3]?\d)[-/])?)?)?(?:[a-zA-Z0-9][^/]+?\/)*?(?<slug>[a-zA-Z0-9][^/]+?)(?:\/index)?$/;

export function parse_from_path(path: string): null | {
	year: number | undefined;
	month: number | undefined;
	day: number | undefined;
	slug: string | undefined;
} {
	const parsed = ARTICLE_DATA_EXTRACT_PATTERN.exec(path);
	if (!parsed) return null;

	return {
		year: parsed.groups?.year ? parseInt(parsed.groups.year) : undefined,
		month: parsed.groups?.month ? parseInt(parsed.groups.month) : undefined,
		day: parsed.groups?.day ? parseInt(parsed.groups.day) : undefined,
		slug: parsed.groups?.slug
	};
}
