// Questions for the scripts, on stderr so stdout stays for results. Answers can also be piped in, one per line.
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { passwordProblem } from '../src/lib/server/password.ts';

const interactive = !!process.stdin.isTTY;
// Readline writes nothing to the terminal while muted, so typed characters (and line edits) stay hidden
let muted = false;
const output = new Writable({ write(chunk, _encoding, callback) { if (!muted) process.stderr.write(chunk); callback(); } });
const rl = createInterface({ input: process.stdin, output, terminal: interactive });
const lines = rl[Symbol.asyncIterator]();
rl.on('SIGINT', () => process.exit(130));

export async function ask(question, hidden = false) {
	process.stderr.write(question);
	muted = hidden;
	const { value } = await lines.next();
	muted = false;
	if (interactive && hidden) process.stderr.write('\n');
	return value ?? '';
}

/** A new password, typed twice and hidden. Asks again until it's valid; exits instead when the input is piped. */
export async function askNewPassword() {
	for (;;) {
		const password = await ask('Password: ', true);
		const problem = password !== await ask('Repeat password: ', true) ? "Passwords don't match" : passwordProblem(password);
		if (!problem) return password;
		console.error(problem);
		if (!interactive) process.exit(1);
	}
}

export const closePrompt = () => rl.close();
