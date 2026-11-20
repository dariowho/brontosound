import { error, json, type RequestHandler } from '@sveltejs/kit';
import TypeOrm from '$lib/db';
import { User } from '$lib/dbEntities/user';
import { listSoundfonts } from '$lib/server/soundfonts';

/** Remember the soundfont the user picked in the player */
export const POST = (async ({ request, locals }) => {
    const { name } = await request.json() as { name: string };
    if (!(await listSoundfonts()).some(soundfont => soundfont.name == name)) error(400, "No such soundfont");

    await (await TypeOrm.getDb()).getRepository(User).update(locals.brontoSession!.user.id, { soundfont: name });
    return json({ name });
}) satisfies RequestHandler;
