import type { RequestHandler } from '@sveltejs/kit';
import { readSoundfontFile } from '$lib/server/soundfonts';

/** A MIDI.js file of a soundfont in data/soundfonts */
export const GET = (async ({ params }) => {
    const file = await readSoundfontFile(params.folder!, params.file!);
    return new Response(new Uint8Array(file), {
        headers: {
            'Content-Type': params.file!.endsWith('.json') ? 'application/json' : 'text/javascript',
            'Cache-Control': 'private, max-age=604800', // a week: soundfonts don't change
        },
    });
}) satisfies RequestHandler;
