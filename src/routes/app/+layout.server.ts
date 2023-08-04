import type { BrontoSession } from "$lib/server/session";
import type { ServerLoadEvent } from "@sveltejs/kit";

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

    return {
        brontoSession
    };
}
