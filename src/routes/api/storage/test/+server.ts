import { getUserStorage, readSettings } from '$lib/server/bandSettings';
import type { RequestHandler } from '@sveltejs/kit';

const TEMP_FILE = 'brontosound-connection-test.tmp'; // safe to delete

const errorOf = (e: any) => String(e?.message ?? e);

/**
 * Test read (list songs folder) and write (create + delete a temp file in the storage root).
 * Responds with an error message per check, or null if it passed.
 */
export const POST = (async () => {
    const storage = await getUserStorage();
    const result: { read: string | null, write: string | null } = { read: null, write: null };

    try {
        await storage.listSubfolders(readSettings().songsFolder!);
    } catch (e) {
        result.read = errorOf(e);
    }

    try {
        await storage.writeTextFile('Temporary file created by Brontosound to test the connection. Safe to delete.', TEMP_FILE);
        await storage.deleteFile(TEMP_FILE);
    } catch (e) {
        result.write = errorOf(e);
    }

    return new Response(JSON.stringify(result));
}) satisfies RequestHandler;
