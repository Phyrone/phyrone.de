import { z } from 'zod';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

// Zod 4 compiles validators with `new Function`. Under our CSP that is blocked,
// and zod's capability probe reports a securitypolicyviolation even when it
// catches the resulting throw (see its `allowsEval` in v4/core/util.js). This
// must run before the first parse, because the probe result is memoized.
//
// Browser-only in effect: zod already disables eval on Cloudflare Workers by
// sniffing navigator.userAgent, so the server side is jitless regardless.
z.config({ jitless: true });

export const reroute = (request) => deLocalizeUrl(request.url).pathname;
