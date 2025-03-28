<script lang="ts">
    import ChordSheetJS from 'chordsheetjs';

    export let rawChords: string;

    const parser = new ChordSheetJS.ChordProParser();
    const formatter = new ChordSheetJS.HtmlTableFormatter();
    let parsedChords, renderedChords;
    $: rawChords, parsedChords = parser.parse(rawChords);
    $: parsedChords, renderedChords = formatter.format(parsedChords);
</script>

<div class="chords">
    <!-- TODO: sanitize -->
    {@html renderedChords}
</div>

<style global>
    :global(.chords) {
        font-family: monospace;
        font-size: 1.2em;
    }

    :global(.chord) {
        font-weight: bold;
    }

    :global(.chords .lyrics) {
        padding: 0 1em 0 0;
    }

    :global(.chords .paragraph) {
        margin-bottom: 1.5em;
    }

    :global(.chords .comment) {
        color: #eb4f27;
        /* border: 1px solid #eb4f27; */
        /* padding:0.2em; */
    }
</style>