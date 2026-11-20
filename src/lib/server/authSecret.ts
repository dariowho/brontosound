const TEMPLATE_SECRET = 'a-secret-of-your-choice'; // the placeholder in .env.template
const RECOMMENDED_LENGTH = 32;
const HOW_TO = 'Generate one with: openssl rand -base64 32';

/** Refuses a missing or placeholder AUTH_SECRET, with which anyone could forge sessions; warns about a short one */
export function checkAuthSecret(secret: string | undefined): void {
    if (!secret || secret === TEMPLATE_SECRET) {
        throw new Error(`AUTH_SECRET is missing or still the .env.template placeholder. ${HOW_TO}`);
    }
    if (secret.length < RECOMMENDED_LENGTH) {
        console.warn(`AUTH_SECRET is shorter than ${RECOMMENDED_LENGTH} characters. ${HOW_TO}`);
    }
}
