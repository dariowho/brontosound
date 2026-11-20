<script lang="ts">
    import MarkedMarkdown from '@magidoc/plugin-svelte-marked';
    import HtmlAsText from './markdown/HtmlAsText.svelte';
    import SafeImage from './markdown/SafeImage.svelte';
    import SafeLink from './markdown/SafeLink.svelte';

    /** Markdown written by users: raw HTML shows as text, links and images keep only safe URLs */
    let { source }: { source: string } = $props();

    const renderers = { html: HtmlAsText, link: SafeLink, image: SafeImage };
</script>

<MarkedMarkdown {source} {renderers} />
