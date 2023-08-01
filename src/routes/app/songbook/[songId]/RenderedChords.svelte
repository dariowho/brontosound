<script lang="ts">
    import ChordSheetJS from 'chordsheetjs';

    export let rawChords: string;

    const parser = new ChordSheetJS.ChordProParser();
    const parsedChords = parser.parse(rawChords);
    const formatter = new ChordSheetJS.HtmlTableFormatter();
    const renderedChords = formatter.format(parsedChords);
</script>

<div class="chords">
    <!-- TODO: sanitize -->
    {@html renderedChords}
</div>

<style global>
    :global(.chord) {
        font-weight: bold;
    }
</style>