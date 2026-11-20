import { getUserStorage, readSettings } from '$lib/server/bandSettings';
import { pathJoin } from '$lib/misc';
import type { RequestHandler } from '@sveltejs/kit';

const TEMP_FILE = 'brontosound-connection-test.tmp'; // safe to delete

const errorOf = (e: any) => String(e?.message ?? e);

/**
 * Test read (list songs folder) and write (create + delete a temp file in it).
 * Responds with an error message per check, or null if it passed.
 */
export const POST = (async () => {
    const storage = await getUserStorage();
    const result: { read: string | null, write: string | null } = { read: null, write: null };

    const songsFolder = readSettings().songsFolder!;
    const tempFile = pathJoin(songsFolder, TEMP_FILE);

    try {
        await storage.listSubfolders(songsFolder);
    } catch (e) {
        result.read = errorOf(e);
    }

    try {
        await storage.writeTextFile('Temporary file created by Brontosound to test the connection. Safe to delete.', tempFile);
        await storage.deleteFile(tempFile);
    } catch (e) {
        result.write = errorOf(e);
    }

    return new Response(JSON.stringify(result));
}) satisfies RequestHandler;
