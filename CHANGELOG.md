# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/dariowho/brontosound/compare/v0.1.0...v0.2.0) (2026-11-21)


### Features

* **auth:** hide edit controls from viewers ([7bf0968](https://github.com/dariowho/brontosound/commit/7bf096844ae8c6ee553a9a4151f8a72320f83c86))
* **auth:** let bands turn off the built-in admin ([4f63a94](https://github.com/dariowho/brontosound/commit/4f63a94485a61db09d104f54e646db02b106147d))
* **auth:** refuse new passwords found in data breaches ([acfe370](https://github.com/dariowho/brontosound/commit/acfe3709cbc30bc802443d0a0a41c80dd732e514))
* **auth:** two-step verification with an authenticator app ([edceea2](https://github.com/dariowho/brontosound/commit/edceea21984f13c4974565f6c562db8e518fe97b))
* **auth:** warn admins in the app about a short AUTH_SECRET ([ccb195d](https://github.com/dariowho/brontosound/commit/ccb195d2ec60cf0c838a65b5e4926a4a0d94ab01))
* **backline:** show and drive Backline's Live page at /backline ([f8d66f4](https://github.com/dariowho/brontosound/commit/f8d66f436607aefa3a63d65aaeea492b054cdcbf))
* **live:** drag gigs between pursuit columns to change their status ([ca0b767](https://github.com/dariowho/brontosound/commit/ca0b76772df44d0a703a7a3317de4752ddd62776))
* **live:** restyle the gig pursuit board ([5e9eff4](https://github.com/dariowho/brontosound/commit/5e9eff47935047a7d5f72c2bd5de9a92f5f14611))
* **maps:** add Mapbox, HERE and OpenStreetMap providers ([f91fc58](https://github.com/dariowho/brontosound/commit/f91fc5896046d584de59a4d899518158cb146b42))
* **player:** play MIDI files through General MIDI soundfonts ([f84c7ca](https://github.com/dariowho/brontosound/commit/f84c7ca6cb4626411638961c5b3298565b0b68b8))
* **profile:** sign out everywhere ([d89d33a](https://github.com/dariowho/brontosound/commit/d89d33aacdcaa6944da7796b26823ef5dfa466dc))
* **settings:** add WebDAV storage connection test ([b613977](https://github.com/dariowho/brontosound/commit/b6139772115381d4f8aee6383dbb950b27695861))
* **setup:** setup page and `npm run init` for a new install ([d194d52](https://github.com/dariowho/brontosound/commit/d194d52e27f62753ddff6c41376c6ee71d6a8f5c))
* **songbook:** song page with folder browser, chart viewers and practice player ([2efcff7](https://github.com/dariowho/brontosound/commit/2efcff727528e967461723069097aacef54c0ec2))
* **songbook:** upload, edit and delete song files; editable title and artist; mobile song page ([1398129](https://github.com/dariowho/brontosound/commit/13981290919cc45ab2aff0d9c04f50f4016337f7))
* **ui:** apply the design system ([0f46f16](https://github.com/dariowho/brontosound/commit/0f46f169b782f0815b291250f5a29ba19da2879e))
* **users:** implement password login and user management ([5b1eabe](https://github.com/dariowho/brontosound/commit/5b1eabe9de9c9f775ff44aeee3bce59d1d441374))


### Bug Fixes

* **api:** save only checked fields from requests, never client JSON as is ([a4a1a5a](https://github.com/dariowho/brontosound/commit/a4a1a5af78528ae4e957eefdbc4a8a3899f7ecf4))
* **auth:** enforce roles on every endpoint and action that changes data ([73baf9e](https://github.com/dariowho/brontosound/commit/73baf9e78e52ae07384b678756cea523b4a5eed7))
* **auth:** guard routes by the matched route, not the URL ([7dfb094](https://github.com/dariowho/brontosound/commit/7dfb0948bb6d1b86215ca30714909fb7f3b277d9))
* **auth:** refuse password checks past a queue cap ([dd0023f](https://github.com/dariowho/brontosound/commit/dd0023f4bfe9d1ea8d4fae2fd1e7fa6bbcbef372))
* **auth:** refuse to start with a missing or placeholder AUTH_SECRET ([adb9985](https://github.com/dariowho/brontosound/commit/adb998588a362d35becfb2cee9cd8aa1ca3cf46a))
* **auth:** require passwords of at least 12 characters ([b8b0b14](https://github.com/dariowho/brontosound/commit/b8b0b14d2f15fa4fa2343cc0c69cc527e57c679a))
* **auth:** slow down guessing per account and per address ([60abdd4](https://github.com/dariowho/brontosound/commit/60abdd469b45071e28b50662d47fe9675eedb165))
* **backline:** cap guest seats, configurable in band settings ([c6d2776](https://github.com/dariowho/brontosound/commit/c6d277612ca251d1c8dd8b958002f167a4d62867))
* **backline:** trade the PIN for a guest token instead of storing it in a cookie ([87de503](https://github.com/dariowho/brontosound/commit/87de50372071c4b9c09ca7a4e5084b8c754b5f3b))
* **backline:** warn before linking, and drop a removed user's links ([9ca0bf2](https://github.com/dariowho/brontosound/commit/9ca0bf2d565a2698a484e079a2e8954ec62eb6c4))
* **deps:** @magidoc/plugin-svelte-marked 9 and marked 18 ([22ed7a4](https://github.com/dariowho/brontosound/commit/22ed7a4b3ff1f12a35bde9c4e32887316b50fda1))
* **deps:** apply semver-compatible security updates ([b99ee6c](https://github.com/dariowho/brontosound/commit/b99ee6cbd40177fbd20c8c64e27a4d37b0aa1ee7))
* **deps:** TypeORM 1 on better-sqlite3 ([5bc7dc3](https://github.com/dariowho/brontosound/commit/5bc7dc37891776366af64cb506bb61e8eedf8722))
* **deps:** Vitest 5 and vite-node 6 ([4db3c59](https://github.com/dariowho/brontosound/commit/4db3c5974995d7835b31c4251348eb7182332bcc))
* **player:** normalise soundfont instruments to match the built-in synth's volume ([532b387](https://github.com/dariowho/brontosound/commit/532b387b5fc98166ba0b51ec7c7adc5d05aed390))
* **privacy:** stop logging gig, interaction and tag payloads ([8aa9be5](https://github.com/dariowho/brontosound/commit/8aa9be5307b81cf121c68c203b8cb1d35b3c6896))
* **security:** keep unexpected error details out of responses ([0e3118e](https://github.com/dariowho/brontosound/commit/0e3118e47520aa5b567e20d8f6bdd5fe1c285cf8))
* **security:** send anti-framing, nosniff and referrer headers ([dfe5b84](https://github.com/dariowho/brontosound/commit/dfe5b84aa0471be6fedf455b0ece05e789b14867))
* **settings:** fix settings page by showing actual values from bandSettings.json ([2ff0b40](https://github.com/dariowho/brontosound/commit/2ff0b408ca5f982e7f472e426226e691806de5f0))
* **songbook:** fix songbook sync issues on storage change ([1f54314](https://github.com/dariowho/brontosound/commit/1f543149d6eba5f2525e7fbbba321b2d8083a28d))
* **storage:** keep every storage path inside the songs folder ([f9c4cbb](https://github.com/dariowho/brontosound/commit/f9c4cbbc309829d86a12e73fb7fa05cc5cd6fd31))
* **storage:** keep the band's files in data/files/, apart from Brontosound's own ([20f0f04](https://github.com/dariowho/brontosound/commit/20f0f0431ab084382c0c32875d9ca9d3625dab03))
* **storage:** set parentPath when listing filesystem song folders ([72cb38e](https://github.com/dariowho/brontosound/commit/72cb38ef20315984a30e240ac51bccf2ff630464))
* **storage:** sync the songs folder with POST, not GET ([331661b](https://github.com/dariowho/brontosound/commit/331661bada77861c8518ad24929583533e714f1a))
* **types:** handle the session and locale the app layout now types ([69ee5c3](https://github.com/dariowho/brontosound/commit/69ee5c38c08620945d84e2e5545a202e7093950d))
* **xss:** render user Markdown and venue links safely ([79c78de](https://github.com/dariowho/brontosound/commit/79c78deb8d81979ad6e97638346589a67fd6aab0))


### Refactors

* **songbook:** remove the legacy songbook ([d1abec7](https://github.com/dariowho/brontosound/commit/d1abec76d4d4f4557973327df0e3241421435947))

## [0.1.0](https://github.com/dariowho/brontosound/releases/tag/v0.1.0) (2025-04-21)

Baseline release: everything up to this tag predates Conventional Commits.

### Features

* songbook: songs, chords (ChordPro) and readme, backed by the DB with files on local storage or WebDAV
* live: venues with Google Maps location, gigs, gig pursuit board and interaction log
* contacts, band settings, Google SSO with role-based users
* Docker image and Node deployment
