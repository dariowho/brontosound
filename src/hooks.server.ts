import { isValidSession, type BrontoSession } from "$lib/server/session";
import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async({event, resolve}) => {

    const brontoSessionString = event.cookies.get('brontoSession');

    let brontoSession: BrontoSession | null = null;
    if (brontoSessionString) {
        try {
            brontoSession = JSON.parse(brontoSessionString)
        } catch (err) {
            console.log("Invalid brontoSessionString: ", brontoSessionString);
        }
    }

    if (event.url.pathname.startsWith('/app') || event.url.pathname.startsWith('/api')) {
        if (! brontoSession || ! isValidSession(brontoSession)) {
            console.log("hook: invalid auth")
            redirect(303, '/');
        }
    }

    const response = await resolve(event);

    return response;
}
