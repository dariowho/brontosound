import { isValidSession, type BrontoSession } from "$lib/session";
import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export function load({ cookies }: ServerLoadEvent) {
    const brontoSessionString = cookies.get('brontoSession');

    let brontoSession: BrontoSession | null = null;
    if (brontoSessionString) {
        try {
            brontoSession = JSON.parse(brontoSessionString)
        } catch (err) {
            console.log("Invalid brontoSessionString: ", brontoSessionString);
        }
    }

    if (! brontoSession|| ! isValidSession(brontoSession)) {
        throw redirect(307, '/');
    }

    console.log(brontoSession);

    return {
        brontoSession
    };
}
