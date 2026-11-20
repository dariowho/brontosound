// Downloads a MIDI.js soundfont into data/soundfonts/<name>, for the song player (docs/songPage.md).
// Default: FluidR3_GM (MIT) from paulrosen's fork of gleitz/midi-js-soundfonts, which adds the drum kit.
//   npm run fetch-soundfont [-- <name> [<base URL>]]
import { mkdir, writeFile, access } from 'node:fs/promises';
import { GM_INSTRUMENTS, GM_PERCUSSION } from '../src/lib/player/gmInstruments.ts';

const [name = 'FluidR3_GM', base = `https://paulrosen.github.io/midi-js-soundfonts/${name}/`] = process.argv.slice(2);
const folder = `data/soundfonts/${name}`;
const files = [...GM_INSTRUMENTS, GM_PERCUSSION].map(instrument => `${instrument}-mp3.js`);

await mkdir(folder, { recursive: true });
let done = 0;
async function fetchFile(file) {
	const path = `${folder}/${file}`;
	if (!(await access(path).then(() => true, () => false))) {
		const response = await fetch(base + file);
		if (!response.ok) return console.error(`${file}: ${response.status} ${response.statusText}`);
		await writeFile(path, Buffer.from(await response.arrayBuffer()));
	}
	process.stderr.write(`\r${++done}/${files.length}`);
}
const queue = [...files];
await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await fetchFile(queue.shift()); }));
console.error(`\n${folder}: done`);
