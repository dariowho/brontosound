import type { Handle, HandleServerError, ServerInit } from "@sveltejs/kit";
import { randomBytes } from "node:crypto";
import { handle as authenticationHandle } from "./auth"
import { sequence } from "@sveltejs/kit/hooks";
import { isApiRoute, isPublicRoute, type BrontoSession } from "$lib/server/session";
import { User } from "$lib/dbEntities/user";
import { instanceToPlain } from "class-transformer";
import { permissionsFromRole } from "$lib/dbEntities/user";
import { error, redirect } from "@sveltejs/kit";
import { findActiveUser } from "$lib/server/users";
import { isSetUp, setupPage } from "$lib/server/setup";
import { settingsPath } from "$lib/server/config";

export const init: ServerInit = async () => {
    if (!await isSetUp()) {
        console.warn(`AUTH_SECRET or ${settingsPath} is missing: pages show how to set up, with npm run init`);
    }
}

// Every request gets the setup instructions until `npm run init` has run: the first one after starts the app
export const setupHandle: Handle = async ({ event, resolve }) => await isSetUp() ? resolve(event) : setupPage();

export const debugHandle: Handle = async ({ event, resolve }) => {
    // console.log("env:",env);
    return resolve(event);
}

export const authorizationHandle: Handle = async ({ event, resolve }) => {
    const authSession = await event.locals.auth();
    // console.log("authSession:", authSession);
    let brontoSession: BrontoSession | null = null;

    // Looked up on every request, so removed users lose access immediately
    const userId = Number(authSession?.user?.id);
    const brontoUser = userId ? await findActiveUser(userId) : null;

    // Authenticated user
    if (authSession && brontoUser) {
        brontoSession = {
            user: instanceToPlain(brontoUser) as User,
            auth: authSession,
            permissions: permissionsFromRole[brontoUser.role],
        }

        // Unauthenticated user
    } else if (!isPublicRoute(event.route.id)) {
        if (isApiRoute(event.route.id)) {
            error(401, 'Your session has expired. Sign in again.');
        }
        redirect(303, '/');
    }

    event.locals['brontoSession'] = brontoSession;

    return resolve(event)
};

// Defence in depth: pages can't be framed by other sites (clickjacking), and browsers don't guess content types.
// No CSP yet: it needs a policy per maps provider, and its own for /backline
const SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const securityHeadersHandle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(name, value);
    }
    return response;
};

// Unexpected errors: the details (paths, SQL, WebDAV URLs) stay in the server log, under an id the user can quote.
// Expected ones, thrown with `error(4xx, message)`, never get here: their message reaches the UI as is
export const handleError: HandleServerError = ({ error, status, message }) => {
    if (status < 500) {
        return { message };
    }
    const id = randomBytes(4).toString('hex');
    console.error(`Error ${id}:`, error);
    return { message: `Something went wrong (error ${id})` };
}

export const handle: Handle = sequence(securityHeadersHandle, setupHandle, debugHandle, authenticationHandle, authorizationHandle)
