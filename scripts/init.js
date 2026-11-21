// Sets up a new Brontosound: .env with a generated AUTH_SECRET, then the data folder (band settings with the admin
// password, empty database and songs folders). Leaves what already exists alone.
//   npm run init
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { filesRoot, localDataRoot, settingsPath } from '../src/lib/server/config.ts';
import { hashPassword } from '../src/lib/server/password.ts';
import { ask, askNewPassword, closePrompt } from './prompt.js';

const envPath = '.env';
const songsFolder = 'Songs';

async function createEnv() {
	const template = await readFile('.env.template', 'utf-8');
	const secret = randomBytes(32).toString('base64');
	await writeFile(envPath, template.replace(/^AUTH_SECRET=.*$/m, `AUTH_SECRET=${secret}`), { flag: 'wx' });
	console.error(`Created ${envPath} with a new AUTH_SECRET. For Google sign-in, set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET there.`);
}

async function createDataFolder() {
	console.error(`Setting up ${localDataRoot}/ for your band.\n`);
	const bandName = (await ask('Band name: ')).trim() || 'My Band';
	console.error('Choose a password for the "admin" user.');
	const password = await askNewPassword();

	await mkdir(`${localDataRoot}/database`, { recursive: true });
	await mkdir(`${filesRoot}/${songsFolder}`, { recursive: true });
	const settings = { bandName, songsFolder, adminPasswordHash: await hashPassword(password) };
	await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', { flag: 'wx' });
	console.error(`\nCreated ${settingsPath}. Your songs go in ${filesRoot}/${songsFolder}/.`);
}

const needsEnv = !existsSync(envPath), needsDataFolder = !existsSync(settingsPath);
if (needsEnv) await createEnv();
if (needsDataFolder) await createDataFolder();
closePrompt();

console.error(needsEnv || needsDataFolder
	? `\nStart Brontosound (or reload its page) and sign in as "admin". The app's Settings page lists what else ${settingsPath} can set.`
	: `${envPath} and ${settingsPath} exist: Brontosound is set up.`);
