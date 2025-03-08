import TypeOrm from "$lib/db";
import { StoredDirectory } from "$lib/dbEntities/storage";
import { getUserStorage } from "./bandSettings";

export async function syncFolder(path: string) {
    // Fetch remote storage
    const storage = await getUserStorage();
    const result: StoredDirectory[] = await storage.listSubfolders(path);

    // Sync cache
    let db = await TypeOrm.getDb()
    await db.transaction(async transactionalEntityManager => {
        await transactionalEntityManager.delete(StoredDirectory, { parentPath: path });
        await transactionalEntityManager.save(StoredDirectory, result);
    });

    return result
}

export async function syncSongsFolder() {
    return await syncFolder("Songs"); // TODO: make configurable
}
