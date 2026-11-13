import { error, json, type RequestHandler } from '@sveltejs/kit';
import { clientFor, join, mayEnter, toHost } from '$lib/server/backline/liveSession';
import { PIN_COOKIE } from '../pinCookie';

// A browser's end of the live session (docs/backline.md): its mailbox to and from Backline.

// Pull: without `id`, takes a seat; with it, waits for Backline's messages after number `after`
export const GET: RequestHandler = async ({ url, locals, cookies }) => {
    if (!mayEnter(locals, cookies.get(PIN_COOKIE))) {
        error(403, 'Not allowed');
    }
    const id = url.searchParams.get('id');
    if (!id) {
        return json({ id: join(locals.brontoSession?.user.name ?? 'Guest'), next: 0, items: [] });
    }
    return json(await clientFor(id).inbox.pull(Number(url.searchParams.get('after')) || 0));
};

// Push: messages for Backline
export const POST: RequestHandler = async ({ url, request, locals, cookies }) => {
    if (!mayEnter(locals, cookies.get(PIN_COOKIE))) {
        error(403, 'Not allowed');
    }
    const id = url.searchParams.get('id') ?? '';
    clientFor(id);
    const { items } = await request.json();
    if (Array.isArray(items)) {
        toHost(id, items.filter(item => typeof item === 'string').slice(0, 64));
    }
    return new Response(null, { status: 204 });
};
