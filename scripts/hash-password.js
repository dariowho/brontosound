// Prompts for a password and prints its hash, e.g. for `adminPasswordHash` in data/bandSettings.json
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { hashPassword, passwordProblem } from '../src/lib/server/password.ts';

const interactive = !!process.stdin.isTTY;
// Readline writes nothing to the terminal while reading, so typed characters (and line edits) stay hidden
let muted = false;
const output = new Writable({ write(chunk, _encoding, callback) { if (!muted) process.stderr.write(chunk); callback(); } });
const rl = createInterface({ input: process.stdin, output, terminal: interactive });
const lines = rl[Symbol.asyncIterator]();
rl.on('SIGINT', () => process.exit(130));

async function ask(question) {
	process.stderr.write(question);
	muted = true;
	const { value } = await lines.next();
	muted = false;
	if (interactive) process.stderr.write('\n');
	return value ?? '';
}

const password = await ask('Password: ');
const repeated = await ask('Repeat password: ');
rl.close();

const problem = password !== repeated ? "Passwords don't match" : passwordProblem(password);
if (problem) {
	console.error(problem);
	process.exit(1);
}
console.log(await hashPassword(password));
