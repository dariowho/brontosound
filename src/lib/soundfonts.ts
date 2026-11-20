/** Sounds for MIDI files (docs/songPage.md): MIDI.js soundfont files under `url`, or the built-in synth (`url` null) */
export interface Soundfont {
    name: string;
    url: string | null;
}

export const BUILT_IN_SYNTH: Soundfont = { name: 'Built-in synth', url: null };

/** The soundfonts the player offers, and the one it starts with (by name) */
export interface SoundfontChoice {
    soundfonts: Soundfont[];
    selected: string;
}
