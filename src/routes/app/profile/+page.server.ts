import { changePassword, countLoginAttempt, verifyCurrentPassword, getProfile, MAX_LOGIN_ATTEMPTS, newPasswordProblem, signOutEverywhere, TooManyLoginAttempts, updateName } from '$lib/server/users';
import { confirmTwoStep, resetTwoStep, startTwoStepSetup, twoStepSetupUri, useTwoStepCode } from '$lib/server/twoStep';
import QRCode from 'qrcode';
import { listLinks, removeLink } from '$lib/server/backline/links';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const profile = await getProfile(locals.brontoSession!.user.id);
    return {
        pageTitle: "Profile",
        breadcrumb: [{title: "Profile"}],
        profile,
        twoStepSetup: await twoStepSetupView(locals.brontoSession!.user.id, profile.login),
        backlineLinks: await listLinks(locals.brontoSession!.user.id),
    };
}) satisfies PageServerLoad;

/** While two-step is being set up: the QR code and key for the authenticator app */
async function twoStepSetupView(userId: number, login: string) {
    const uri = await twoStepSetupUri(userId, login);
    return uri ? { qr: await QRCode.toDataURL(uri, { margin: 1, width: 180 }), secret: new URL(uri).searchParams.get('secret')! } : null;
}

const WRONG_CODE = 'Wrong code. Enter the one your app shows now.';
const tooManyCodes = (userId: number) => countLoginAttempt(`two-step:${userId}`) > MAX_LOGIN_ATTEMPTS;

export const actions = {
    updateName: async ({ request, locals }) => {
        const name = String((await request.formData()).get('name') ?? '').trim();
        if (!name || name.length > 100) {
            return fail(400, { nameError: 'Name must be 1 to 100 characters' });
        }
        await updateName(locals.brontoSession!.user.id, name);
        return { nameSaved: true };
    },

    changePassword: async ({ request, locals }) => {
        const data = await request.formData();
        const { user } = locals.brontoSession!;
        const profile = await getProfile(user.id);
        if (profile.isDefaultAdmin) {
            return fail(400, { passwordError: 'This password is set in bandSettings.json' });
        }
        // Users who only signed in with Google have no password to confirm yet
        if (profile.hasPassword) {
            try {
                if (!await verifyCurrentPassword(user.id, String(data.get('currentPassword') ?? ''))) {
                    return fail(400, { passwordError: 'Current password is wrong' });
                }
            } catch (e) {
                if (e instanceof TooManyLoginAttempts) {
                    return fail(429, { passwordError: 'Too many attempts. Try again in 15 minutes.' });
                }
                throw e;
            }
        }
        const newPassword = String(data.get('newPassword') ?? '');
        if (newPassword !== data.get('confirmPassword')) {
            return fail(400, { passwordError: "New passwords don't match" });
        }
        const problem = await newPasswordProblem(newPassword);
        if (problem) {
            return fail(400, { passwordError: problem });
        }
        await changePassword(user.id, newPassword);
        redirect(303, '/signin?passwordChanged');
    },

    signOutEverywhere: async ({ locals }) => {
        await signOutEverywhere(locals.brontoSession!.user.id);
        redirect(303, '/signin');
    },

    startTwoStep: async ({ locals }) => {
        const { user } = locals.brontoSession!;
        if (!(await getProfile(user.id)).hasPassword) {
            return fail(400, { twoStepError: 'Set a password first: two-step verification is for password sign-in' });
        }
        await startTwoStepSetup(user.id);
    },

    confirmTwoStep: async ({ request, locals }) => {
        const { user } = locals.brontoSession!;
        if (tooManyCodes(user.id)) {
            return fail(429, { twoStepError: 'Too many attempts. Try again in 15 minutes.' });
        }
        if (!await confirmTwoStep(user.id, String((await request.formData()).get('code') ?? ''))) {
            return fail(400, { twoStepError: WRONG_CODE });
        }
        await signOutEverywhere(user.id); // the other sessions never gave a code
        redirect(303, '/signin?twoStepOn');
    },

    // Turns two-step off with a code, or cancels setting it up
    turnOffTwoStep: async ({ request, locals }) => {
        const { user } = locals.brontoSession!;
        if ((await getProfile(user.id)).twoStepEnabled) {
            if (tooManyCodes(user.id)) {
                return fail(429, { twoStepError: 'Too many attempts. Try again in 15 minutes.' });
            }
            if (!await useTwoStepCode(user.id, String((await request.formData()).get('code') ?? ''))) {
                return fail(400, { twoStepError: WRONG_CODE });
            }
        }
        await resetTwoStep(user.id);
    },

    unlinkBackline: async ({ request, locals }) => {
        await removeLink(locals.brontoSession!.user.id, Number((await request.formData()).get('id')));
    },
} satisfies Actions;
