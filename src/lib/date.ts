/**
 * dayjs configured for user-facing date display.
 *
 * Separate from `post-meta.ts`, which parses build-time frontmatter and needs
 * a different plugin set. This module is what ships to the browser.
 *
 * Locale data is a static import resolved from node_modules at build time —
 * never a CDN fetch. Add a `dayjs/locale/<code>.js` import here for every
 * locale Paraglide gains, otherwise `.locale()` silently falls back to English.
 */
import dayjs from 'dayjs';
import 'dayjs/locale/de.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default dayjs;
