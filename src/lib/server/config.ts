export const devMode: boolean = true;
// export const apiToken: string = "dev-api-token"; // TODO: enforce external configuration
export const localDataRoot: string = "data"
// The band's own files, with the filesystem backend. The rest of data/ is Brontosound's
export const filesRoot: string = `${localDataRoot}/files`;
export const settingsFilename: string = 'bandSettings.json';
// Created by `npm run init`: until it exists, Brontosound only shows how to set it up
export const settingsPath: string = `${localDataRoot}/${settingsFilename}`;
