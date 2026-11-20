import type { Handle, HandleServerError, ServerInit } from "@sveltejs/kit";
import { handle as authenticationHandle } from "./auth"
import { sequence } from "@sveltejs/kit/hooks";
import { isApiRoute, isPublicRoute, type BrontoSession } from "$lib/server/session";
import { User } from "$lib/dbEntities/user";
import { instanceToPlain } from "class-transformer";
import { permissionsFromRole } from "$lib/dbEntities/user";
import { error, redirect } from "@sveltejs/kit";
import { ensureDefaultAdmin, findActiveUser } from "$lib/server/users";

export const init: ServerInit = async () => {
    await ensureDefaultAdmin();
}

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

// Send the actual error message to API clients, so the UI can display it
export const handleError: HandleServerError = ({ error, event }) => {
    console.error(error);
    if (isApiRoute(event.route.id))
        return { message: error instanceof Error ? error.message : String(error) };
}

export const handle: Handle = sequence(debugHandle, authenticationHandle, authorizationHandle)
