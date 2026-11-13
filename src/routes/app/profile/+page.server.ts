import { changePassword, verifyCurrentPassword, getProfile, TooManyLoginAttempts, updateName } from '$lib/server/users';
import { passwordProblem } from '$lib/server/password';
import { listLinks, removeLink } from '$lib/server/backline/links';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    return {
        pageTitle: "Profile",
        breadcrumb: [{title: "Profile"}],
        profile: await getProfile(locals.brontoSession!.user.id),
        backlineLinks: await listLinks(locals.brontoSession!.user.id),
    };
}) satisfies PageServerLoad;

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
        const problem = passwordProblem(newPassword);
        if (problem) {
            return fail(400, { passwordError: problem });
        }
        await changePassword(user.id, newPassword);
        redirect(303, '/signin?passwordChanged');
    },

    unlinkBackline: async ({ request, locals }) => {
        await removeLink(locals.brontoSession!.user.id, Number((await request.formData()).get('id')));
    },
} satisfies Actions;
