import { error, json, type RequestHandler } from '@sveltejs/kit';
import { claimLink, isLinkRequest } from '$lib/server/backline/links';

// Backline asks whether its link request was confirmed at /backline/link: 404 until then, the token once after
export const POST: RequestHandler = async ({ request }) => {
    const { request: linkRequest } = await request.json();
    const token = isLinkRequest(linkRequest) ? claimLink(linkRequest) : null;
    if (!token) {
        error(404, 'Not confirmed');
    }
    return json({ token });
};
