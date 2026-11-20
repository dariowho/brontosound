<script lang="ts">
    import type { Tokens } from 'marked';
    import { safeUrl } from '$lib/safeUrl';

    export let token: Tokens.Image;
</script>

<img src={safeUrl(token.href)} title={token.title} alt={token.text} class="max-w-full" />
