# Song page

A song's page shows its title and artist (click either to edit both), its folder in storage, the selected document, and a player fixed to the bottom of the screen. On phones the player is one bar that opens a sheet with every control.

- **Folder**: icons for everything in the song folder, browsable into subfolders. Accent icons open in Brontosound; grey ones can only be downloaded. Upload, or files dropped on the folder, go into the folder shown, one at a time; a name already there is refused.
- **Viewer**: the selected document. Files Brontosound can't show get a download panel. Plain-text files (text, Markdown, ChordPro, OnSong) can be edited: Ctrl+S saves, leaving with unsaved changes asks first. Delete, here or in the player, removes the file from storage and unpins it.
- **Player**: audio and MIDI files, or the chart in the viewer (a metronome counting through its bars). With both, the player asks which; the file is the default. × next to a file's name takes it out of the player; with no chart in the viewer, the player closes.

One document and one audio file can be pinned (`Song.pinnedDocument`, `Song.pinnedAudio`, paths relative to the song folder). Pinned files open with the page; with nothing pinned, the first document and the first audio file by name do.

## Formats

| Kind | Extensions | Opens in |
| --- | --- | --- |
| ChordPro | `.cho .chopro .chordpro .crd .pro` | viewer + player |
| OnSong | `.onsong` | viewer + player |
| iReal Pro | `irealb://` links in `.html` (iReal Pro's export) or `.txt` | viewer + player |
| Chords over lyrics | `.txt` with two or more chord lines | viewer + player |
| Markdown, text, PDF | `.md .txt .pdf` | viewer |
| Audio | `.wav .mp3 .ogg .opus .flac .m4a .aac .aif .aiff` | player |
| MIDI | `.mid .midi` | player |

- ChordPro: [directives](https://www.chordpro.org/chordpro/chordpro-directives/) for metadata, verse/chorus/bridge/tab/grid sections with labels, `{chorus}` recall (shown as a comment, as ChordPro prints it), comments, `[*annotations]`. Formatting directives, `{define}` and notation sections (`abc`, `ly`, `svg`, `textblock`) are ignored; so are directives with an instrument or user selector.
- OnSong: [metadata block](https://onsongapp.com/docs/features/formats/onsong/metadata), `Verse 1:` labels, bracketed chords and chords over lyrics, `(instructions)`; `# notes` are hidden.
- iReal Pro: the format isn't published; parsing follows ireal-renderer and ireal-reader (MIT). Charts are drawn as iReal Pro does, 16 cells to a row.

## Playing a chart

Charts don't say how long a line lasts, so: a lyrics line lasts one bar per chord (one bar if it has none), grid bars and iReal bars count as written. Tempo and time come from the chart (`{tempo}`, `{time}`), else 120 bpm in 4/4. Repeats and codas are not followed. Key in the player and in the viewer is the same control.

## Player

Space plays and pauses. Click the timeline to set a start point: every play starts there. Drag across it to loop a part. Arrows move 5 s (a bar on a chart).

- Tempo (Speed for audio files), Transpose (semitones, ±12) and Pitch (cents, ±50) can be typed or stepped.
- Audio files are decoded in memory, so playback starts at once from any point. Speed and pitch change independently through [SoundTouch](https://github.com/cutterbl/SoundTouchJS) (an AudioWorklet), bypassed at the original speed and pitch. Formats the browser can't decode (AIFF outside Safari) can't be played.
- MIDI files play through a soundfont (sampled General MIDI instruments and drums) or a small built-in synth (oscillators, noise drums), with tracks that can be switched off. **Sound** picks which; see below.

## Soundfonts

The player offers the built-in synth, every folder in `data/soundfonts/`, then `soundfonts` in band settings (`[{ "name": …, "url": … }]`). `defaultSoundfont` (a name) is where users start; each user's last pick is kept (`User.soundfont`). With neither, the first soundfont after the synth.

A soundfont is the [MIDI.js](https://github.com/gleitz/midi-js-soundfonts) layout: `<instrument>-mp3.js` per GM instrument, plus `percussion-mp3.js` for drums. Only the instruments a file uses are loaded. An instrument that can't load plays through the built-in synth; if none can, the player says so.

- **Self-hosted** (no third-party requests): `npm run fetch-soundfont` downloads FluidR3_GM (MIT, ~300 MB) into `data/soundfonts/FluidR3_GM/`, served to signed-in users by `/api/soundfont/<folder>/<file>`. `npm run fetch-soundfont -- <name> [<base URL>]` for another one.
- **By URL**: e.g. `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/` (no drums) or `https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/`. Every browser that plays a MIDI file then fetches from that host. The server must allow CORS.

## Code

- `src/lib/songFiles/`: file kinds by extension, loading a file into a `SongDocument`.
- `src/lib/chords/`: one parser per format into `ChordChart` (or `IRealSong`), transposition, `chartTimeline.ts` (bars for the player).
- `src/lib/player/`: one engine per source, behind `PlaybackEngine`; `transport.svelte.ts` holds the practice controls. MIDI notes go to `MidiInstruments`: `sampler.ts` (soundfonts) or `midiSynth.ts`.
- `src/lib/server/soundfonts.ts`: the soundfonts on offer and the user's pick; `/api/soundfont` remembers it.
- `src/lib/components/{songFolder,viewer,player}/`, and the page in `src/routes/app/songbook/[songId]/[songSlug]/`.
- `/api/song/[songId]/folder`, `/file` and `/pins`: files are addressed relative to the song folder and can't leave it. `/file` also takes uploads (POST), saves (PUT) and deletions (DELETE); the request body is the file. adapter-node caps bodies at 512K unless `BODY_SIZE_LIMIT` is set (the Dockerfile sets 200M).
- `PATCH /api/song/[songId]`: title and artist. The folder keeps its name.
