import TypeOrm from "$lib/db";
import { StoredDirectory, StoredFile } from "$lib/dbEntities/storage";
import path from "path";
import { getUserStorage, readSettings } from "./bandSettings";

export async function syncFolder(path: string): Promise<StoredDirectory[]> {
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
    const bandSettings = await readSettings();
    await (await getUserStorage()).createDirectory(bandSettings.songsFolder);
    return await syncFolder(bandSettings.songsFolder);
}

export async function writeTextFile(path:string, content: string) {
    const [storage, db] = await Promise.all([
        getUserStorage(),
        TypeOrm.getDb()
    ]);
    const result: StoredFile = await storage.writeTextFile(content, path);
    let files = db.getRepository(StoredFile)
    files.save(result);
    return result;
}
