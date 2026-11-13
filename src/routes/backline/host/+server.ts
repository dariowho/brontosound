import { error, json, type RequestHandler } from '@sveltejs/kit';
import { findLinkedUser, hashToken } from '$lib/server/backline/links';
import { announce, hostFor, toClients } from '$lib/server/backline/liveSession';

// The Backline app's end of the live session (docs/backline.md). It signs in with the token of its link and names itself with
// `instance`, so that a second Backline taking over is told apart from the first one reconnecting.

function bearerToken(request: Request): string {
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    if (!token) {
        error(401, 'Missing token');
    }
    return token;
}

const instanceOf = (url: URL) => url.searchParams.get('instance') ?? '';

// Announce: become the live Backline, say who gets in and hand over the page browsers will show
export const PUT: RequestHandler = async ({ request, url }) => {
    const token = bearerToken(request);
    if (!await findLinkedUser(token)) {
        error(401, 'Unknown token');
    }
    const body = await request.json();
    return json(announce({
        instance: instanceOf(url),
        tokenHash: hashToken(token),
        public: body.public === true,
        pin: String(body.pin ?? ''),
        page: String(body.page ?? ''),
    }));
};

// Pull: what browsers did since message `after`. Waits until there is something
export const GET: RequestHandler = async ({ request, url }) => {
    const host = hostFor(instanceOf(url), hashToken(bearerToken(request)));
    return json(await host.inbox.pull(Number(url.searchParams.get('after')) || 0));
};

// Push: messages for browsers
export const POST: RequestHandler = async ({ request, url }) => {
    hostFor(instanceOf(url), hashToken(bearerToken(request)));
    const { items } = await request.json();
    if (Array.isArray(items)) {
        toClients(items.filter(item => typeof item?.c === 'string' && typeof item?.m === 'string'));
    }
    return new Response(null, { status: 204 });
};
