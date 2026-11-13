import { fail } from '@sveltejs/kit';
import { isPin, liveBackline, mayEnter } from '$lib/server/backline/liveSession';
import { countLoginAttempt, MAX_LOGIN_ATTEMPTS } from '$lib/server/users';
import { PIN_COOKIE } from './pinCookie';
import type { Actions, PageServerLoad } from './$types';

export const load = (({ locals, cookies }) => {
    const live = liveBackline();
    const allowed = mayEnter(locals, cookies.get(PIN_COOKIE));
    return {
        live: !!live,
        // The remote, as the live Backline sent it
        page: allowed ? live!.page : null,
        asksPin: !allowed && !!live?.public,
    };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, cookies, getClientAddress }) => {
        const pin = String((await request.formData()).get('pin') ?? '');
        if (countLoginAttempt(`backline|${getClientAddress()}`) > MAX_LOGIN_ATTEMPTS) {
            return fail(429, { pinError: 'Too many attempts. Try again in 15 minutes.' });
        }
        if (!liveBackline()?.public || !isPin(pin)) {
            return fail(400, { pinError: 'Wrong PIN' });
        }
        cookies.set(PIN_COOKIE, pin, { path: '/backline', maxAge: 12 * 60 * 60 });
    },
} satisfies Actions;
