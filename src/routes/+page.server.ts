import { readFile } from "fs/promises";
import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ }: ServerLoadEvent) {
    try {
        return { staticContent: await readFile('data/publicSite/index.html', 'utf-8') };
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code == 'ENOENT') return { staticContent: null }; // no public site yet: show the placeholder
        throw err;
    }
}
