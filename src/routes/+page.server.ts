import { FilesystemStorage } from "$lib/storage";
import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ }: ServerLoadEvent) {
    const storage = new FilesystemStorage('data/publicSite');
    
    return {
        staticContent: storage.readTextFileContent('index.html'),
    }
}
