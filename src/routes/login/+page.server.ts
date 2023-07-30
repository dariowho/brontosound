import type { ServerLoadEvent } from "@sveltejs/kit";

// export function load({ cookies, url }: ServerLoadEvent) {

// }

import type { Actions } from './$types';

export const actions = {
    signIn: async ({cookies, request}) => {
        // console.log("Received form: ", request)
        cookies.set('brontoSession', JSON.stringify({
            username: "mimmo",
            accessToken: "fake-access-token"
        }), { path: '/' });
        return({
            signedIn: true
        });
    },

    signOut: async ({cookies, request}) => {
        cookies.delete('brontoSession');
        return {
            signedOut: true
        }
    },
} satisfies Actions;