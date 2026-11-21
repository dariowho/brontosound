import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import { SvelteKitAuth } from "@auth/sveltekit";
import { authenticateWithPassword, ensureBootstrapAdmin, findActiveUser, findOrLinkUser, findUserByAccount, isBootstrapAdmin, normalizeEmail } from "$lib/server/users";

declare module "@auth/core/jwt" {
    interface JWT {
        // Brontosound User.id and User.sessionVersion, set at sign-in
        userId?: number
        sessionVersion?: number
    }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [
        Google,
        Credentials({
            credentials: { email: {}, password: {}, code: {} }, // code: two-step verification, when the user has it
            async authorize({ email, password, code }) {
                if (typeof email !== 'string' || typeof password !== 'string') {
                    return null;
                }
                const user = await authenticateWithPassword(email, password, typeof code === 'string' ? code : '');
                return user ? { id: String(user.id), email: user.email, name: user.name } : null;
            },
        }),
    ],
    pages: { signIn: '/signin', error: '/signin' },
    callbacks: {
        // Google sign-in is allowed if the account is linked, or its verified email matches a user (it then gets linked)
        async signIn({ account, profile }) {
            if (account?.provider === 'credentials') {
                return true;
            }
            if (account?.provider !== 'google' || !profile?.email || !profile.email_verified) {
                return false;
            }
            const email = normalizeEmail(profile.email);
            if (isBootstrapAdmin(email)) {
                await ensureBootstrapAdmin(email, profile.name ?? email);
            }
            return !!await findOrLinkUser('google', account.providerAccountId, email);
        },
        // Runs at sign-in (`account` set) and on every session read. Returning null clears the session cookie: done
        // when the user is gone or was signed out everywhere (sessionVersion bumped), and for tokens without userId
        async jwt({ token, user, account }) {
            const brontoUser = !account ? (token.userId ? await findActiveUser(token.userId) : null)
                : account.provider === 'credentials' ? await findActiveUser(Number(user.id))
                : await findUserByAccount(account.provider, account.providerAccountId);
            if (!brontoUser || (!account && brontoUser.sessionVersion !== token.sessionVersion)) {
                return null;
            }
            token.userId = brontoUser.id;
            token.sessionVersion = brontoUser.sessionVersion;
            return token;
        },
        session({ session, token }) {
            session.user.id = token.userId?.toString() ?? '';
            return session;
        },
    },
    trustHost: true,
})
