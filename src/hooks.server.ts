import type { Handle } from "@sveltejs/kit";
import { handle as authenticationHandle } from "./auth"
import { sequence } from "@sveltejs/kit/hooks";
import type { BrontoSession } from "$lib/server/session";
import TypeOrm from "$lib/db";
import { User } from "$lib/dbEntities/user";
import { UserRole } from "$lib/dbEntities/user";
import { instanceToPlain } from "class-transformer";
import { permissionsFromRole } from "$lib/dbEntities/user";
import { redirect } from "@sveltejs/kit";

export const authorizationHandle: Handle = async ({ event, resolve }) => {
    const authSession = await event.locals.auth();
    // console.log("authSession:", authSession);
    let brontoSession: BrontoSession | null = null;

    // Authenticated user
    if (authSession) {
        // console.log("hooks.server.ts: authSession: ", authSession);
        const userRepository = await TypeOrm.getRepository(User);
        let brontoUser: User | null = await userRepository.findOneBy({ email: authSession.user.email });

        if (!brontoUser) {
            console.log("hooks.server.ts: creating new user");
            let newUser = new User();
            newUser.email = authSession.user.email;
            newUser.username = authSession.user.email;
            newUser.name = authSession.user.name;
            newUser.role = UserRole.EDITOR; // TODO: let admin select roles
            brontoUser = await userRepository.save(newUser);
        }

        brontoSession = {
            user: instanceToPlain(brontoUser) as User,
            auth: authSession,
            permissions: permissionsFromRole[brontoUser.role],
        }

        // Unauthenticated user
    } else {
        console.log("hooks.server.ts: no authSession");
        if (event.url.pathname.startsWith('/app') || event.url.pathname.startsWith('/api')) {
            console.log("invalid auth")
            redirect(303, '/');
        }
    }

    event.locals['brontoSession'] = brontoSession;

    return resolve(event)
};

export const handle: Handle = sequence(authenticationHandle, authorizationHandle)