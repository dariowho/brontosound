<script lang="ts">
    import { faDownload } from '@fortawesome/free-solid-svg-icons';
    import { Button } from 'flowbite-svelte';
    import Fa from 'svelte-fa';
    import { fileTypeLabel } from '$lib/songFiles/fileTypes';
    import { formatSize, type SongFile } from '$lib/songFiles/songFile';
    import FileIcon from '../songFolder/FileIcon.svelte';

    /** A file Brontosound can't show, and the way to get it */
    let { file, downloadUrl }: { file: SongFile, downloadUrl: string } = $props();

    let details = $derived([fileTypeLabel(file), file.size !== undefined && formatSize(file.size)].filter(Boolean).join(' · '));
</script>

<div class="flex flex-col items-center gap-3 px-6 pb-16 pt-14 text-center">
    <FileIcon {file} width={56} downloadOnly />
    <div class="mt-1 text-xl font-bold text-gray-900">{file.name}</div>
    <p class="max-w-md text-sm text-gray-600">Brontosound can't show this file. Download it to open it on your device.</p>
    <Button href={downloadUrl} class="mt-2"><Fa icon={faDownload} class="me-2" />Download {file.name}</Button>
    <span class="text-[13px] text-gray-500">{details}</span>
</div>
