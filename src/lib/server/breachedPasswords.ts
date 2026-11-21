import { createHash } from 'node:crypto';

const RANGE_API = 'https://api.pwnedpasswords.com/range/';

/**
 * How many times `password` appears in known data breaches (Have I Been Pwned), or null when that can't be checked.
 * Only the first 5 characters of its SHA-1 hash leave the server (k-anonymity), padded so the response size says nothing.
 */
export async function breachCount(password: string, fetchRange: typeof fetch = fetch): Promise<number | null> {
    const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    try {
        const response = await fetchRange(RANGE_API + hash.slice(0, 5), { headers: { 'Add-Padding': 'true' }, signal: AbortSignal.timeout(3000) });
        if (!response.ok) return null;
        const match = (await response.text()).split('\n').find(line => line.startsWith(hash.slice(5) + ':'));
        return match ? parseInt(match.split(':')[1]) : 0;
    } catch {
        return null;
    }
}
