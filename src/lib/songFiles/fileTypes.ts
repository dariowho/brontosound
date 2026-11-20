import type { SongFile } from './songFile';

/**
 * What the song page does with a file, decided by its extension (docs/songPage.md):
 * documents open in the viewer, audio and MIDI in the player, anything else can only be downloaded.
 * `text` files are read first: they can hold a chord chart or an iReal Pro link.
 */
export type FileKind = 'folder' | 'chordpro' | 'onsong' | 'text' | 'markdown' | 'pdf' | 'audio' | 'midi' | 'other';

interface FileType {
    kind: FileKind;
    label: string; // shown next to the file name
}

const FILE_TYPES: Record<string, FileType> = {
    cho: { kind: 'chordpro', label: 'ChordPro' },
    chopro: { kind: 'chordpro', label: 'ChordPro' },
    chordpro: { kind: 'chordpro', label: 'ChordPro' },
    crd: { kind: 'chordpro', label: 'ChordPro' },
    pro: { kind: 'chordpro', label: 'ChordPro' },
    onsong: { kind: 'onsong', label: 'OnSong' },
    txt: { kind: 'text', label: 'Text' },
    html: { kind: 'text', label: 'Web page' },
    htm: { kind: 'text', label: 'Web page' },
    md: { kind: 'markdown', label: 'Markdown' },
    markdown: { kind: 'markdown', label: 'Markdown' },
    pdf: { kind: 'pdf', label: 'PDF' },
    wav: { kind: 'audio', label: 'WAV' },
    mp3: { kind: 'audio', label: 'MP3' },
    ogg: { kind: 'audio', label: 'Ogg' },
    opus: { kind: 'audio', label: 'Opus' },
    flac: { kind: 'audio', label: 'FLAC' },
    m4a: { kind: 'audio', label: 'M4A' },
    aac: { kind: 'audio', label: 'AAC' },
    aif: { kind: 'audio', label: 'AIFF' },
    aiff: { kind: 'audio', label: 'AIFF' },
    mid: { kind: 'midi', label: 'MIDI' },
    midi: { kind: 'midi', label: 'MIDI' },
    // Download only, with a readable name
    zip: { kind: 'other', label: 'ZIP archive' },
    sib: { kind: 'other', label: 'Sibelius score' },
    mscz: { kind: 'other', label: 'MuseScore score' },
    musicxml: { kind: 'other', label: 'MusicXML score' },
    mxl: { kind: 'other', label: 'MusicXML score' },
    gp: { kind: 'other', label: 'Guitar Pro file' },
};

function extensionOf(name: string): string {
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

function fileType(file: SongFile): FileType {
    if (file.isFolder) return { kind: 'folder', label: 'Folder' };
    const extension = extensionOf(file.name);
    return FILE_TYPES[extension] ?? { kind: 'other', label: extension ? `${extension.toUpperCase()} file` : 'File' };
}

export const fileKind = (file: SongFile): FileKind => fileType(file).kind;
export const fileTypeLabel = (file: SongFile): string => fileType(file).label;
export const isWebPage = (file: SongFile): boolean => fileTypeLabel(file) == 'Web page';

/** Where a file opens: folders are browsed, playable files go to the player, the rest to the viewer */
export function slotOf(file: SongFile): 'folder' | 'player' | 'viewer' {
    const kind = fileKind(file);
    if (kind == 'folder') return 'folder';
    return kind == 'audio' || kind == 'midi' ? 'player' : 'viewer';
}

/** Plain-text files, which can be edited in the browser */
export const isEditableText = (file: SongFile): boolean => ['chordpro', 'onsong', 'text', 'markdown'].includes(fileKind(file)) && !isWebPage(file);

export const isDownloadOnly = (file: SongFile): boolean => fileKind(file) == 'other';
export const isDocument = (file: SongFile): boolean => slotOf(file) == 'viewer' && !isDownloadOnly(file);
export const isPlayable = (file: SongFile): boolean => slotOf(file) == 'player';

/** What a file does, for its tooltip */
export function fileHint(file: SongFile): string {
    const kind = fileKind(file);
    if (kind == 'folder') return 'Open folder';
    if (kind == 'other') return 'Download only';
    if (kind == 'chordpro' || kind == 'onsong') return 'Opens in the viewer and can drive the player';
    if (isPlayable(file)) return 'Plays in the player';
    return 'Opens in the viewer';
}

/** The files the song page opens with when nothing is pinned: the first document and the first audio file, by name */
export function defaultFiles(files: SongFile[]): { document?: SongFile, audio?: SongFile } {
    return {
        document: files.find(isDocument),
        audio: files.find(file => fileKind(file) == 'audio') ?? files.find(isPlayable),
    };
}
