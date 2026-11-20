<script lang="ts">
    import type { Tokens } from 'marked';
    import { safeUrl } from '$lib/safeUrl';

    export let token: Tokens.Link;
</script>

<a href={safeUrl(token.href)} title={token.title}><slot /></a>
