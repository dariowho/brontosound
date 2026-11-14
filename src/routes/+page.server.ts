import { FileNotFoundError, FilesystemStorage } from "$lib/storage";
import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ }: ServerLoadEvent) {
    const storage = new FilesystemStorage('data/publicSite');
    try {
        return { staticContent: storage.readTextFileContent('index.html') };
    } catch (err) {
        if (err instanceof FileNotFoundError) return { staticContent: null }; // no public site yet: show the placeholder
        throw err;
    }
}
