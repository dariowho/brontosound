import "reflect-metadata" // Needed by TypeORM
import type { BrontoSession } from "$lib/server/session"

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			brontoSession: BrontoSession | null
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
