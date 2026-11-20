<script lang="ts">
    import Markdown from '@magidoc/plugin-svelte-marked';

    let { text }: { text: string } = $props();
</script>

<div class="markdown flex max-w-3xl flex-col gap-3 px-10 pb-10 pt-7 text-base text-gray-900">
    <Markdown source={text} />
</div>

<style>
    .markdown :global(h1), .markdown :global(h2) { font-size: 22px; line-height: 1.3; font-weight: 700; }
    .markdown :global(h3), .markdown :global(h4) { font-size: 18px; font-weight: 700; }
    .markdown :global(p) { color: #4b5563; } /* gray-600 */
    .markdown :global(ul) { list-style: disc; padding-left: 22px; }
    .markdown :global(ol) { list-style: decimal; padding-left: 22px; }
    .markdown :global(li) { margin: 6px 0; }
    .markdown :global(a) { color: #cc4522; text-decoration: underline; } /* primary-800 */
    .markdown :global(code) { font-family: 'Ubuntu Mono', ui-monospace, monospace; }
    .markdown :global(pre) { white-space: pre-wrap; }
    .markdown :global(blockquote) { border-left: 2px solid #d1d5db; padding-left: 16px; color: #4b5563; }
</style>
