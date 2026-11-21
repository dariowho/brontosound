import { CredentialsSignin } from "@auth/sveltekit"
import { fail } from "@sveltejs/kit"
import { signIn } from "../../auth"
import type { Actions } from "./$types"

export const actions: Actions = {
    default: async (event) => {
        try {
            await signIn(event)
        } catch (e) {
            // Wrong email/password: Auth.js throws instead of redirecting when called from a form action
            if (e instanceof CredentialsSignin) {
                return fail(['too_many_attempts', 'slow_down', 'busy'].includes(e.code) ? 429 : 400, { credentialsError: e.code })
            }
            throw e
        }
    }
}
