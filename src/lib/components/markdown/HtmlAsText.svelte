<script lang="ts">
    import type { Tokens } from 'marked';

    // Raw HTML in user Markdown shows as typed: rendering it would run scripts. Legacy syntax: Markdown renderers
    // are Svelte 4 components
    export let token: Tokens.HTML;
</script>

{token.text}
