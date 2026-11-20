# Song page

A song's page shows its folder in storage, the selected document, and a player fixed to the bottom of the screen.

- **Folder**: icons for everything in the song folder, browsable into subfolders. Accent icons open in Brontosound; grey ones can only be downloaded.
- **Viewer**: the selected document. Files Brontosound can't show get a download panel.
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

- Audio files are decoded in memory, so playback starts at once from any point. Speed and pitch change independently through [SoundTouch](https://github.com/cutterbl/SoundTouchJS) (an AudioWorklet), bypassed at the original speed and pitch. Formats the browser can't decode (AIFF outside Safari) can't be played.
- MIDI files play through a small built-in synth (oscillators, noise drums), with tracks that can be switched off.

## Code

- `src/lib/songFiles/`: file kinds by extension, loading a file into a `SongDocument`.
- `src/lib/chords/`: one parser per format into `ChordChart` (or `IRealSong`), transposition, `chartTimeline.ts` (bars for the player).
- `src/lib/player/`: one engine per source, behind `PlaybackEngine`; `transport.svelte.ts` holds the practice controls.
- `src/lib/components/{songFolder,viewer,player}/`, and the page in `src/routes/app/songbook/[songId]/[songSlug]/`.
- `/api/song/[songId]/folder`, `/file` and `/pins`: files are addressed relative to the song folder and can't leave it.
