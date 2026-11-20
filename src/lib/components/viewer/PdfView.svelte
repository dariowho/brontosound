<script lang="ts">
    import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
    import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

    /** One page of a PDF at a time, drawn by pdf.js so it looks the same on every device */
    let { url, page = $bindable(1), pageCount = $bindable(0) }: { url: string, page?: number, pageCount?: number } = $props();

    let canvas: HTMLCanvasElement;
    let width = $state(0);
    let pdf = $state.raw<PDFDocumentProxy | null>(null);
    let error = $state<string | null>(null);

    $effect(() => {
        pdf = null;
        error = null;
        loadPdf(url).then(loaded => {
            pdf = loaded;
            pageCount = loaded.numPages;
            page = 1;
        }, e => error = (e as Error).message);
    });

    $effect(() => {
        if (!pdf || !width) return;
        let rendering: RenderTask | undefined;
        let cancelled = false;
        renderPage(pdf, page, Math.min(width - 48, 880)).then(task => {
            rendering = task;
            task.promise.catch(() => {}); // cancelled: a newer page or size replaced it
            if (cancelled) task.cancel();
        });
        return () => {
            cancelled = true;
            rendering?.cancel();
        };
    });

    async function loadPdf(url: string): Promise<PDFDocumentProxy> {
        const pdfjs = await import('pdfjs-dist'); // browser only, and only when a PDF opens
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        return pdfjs.getDocument({ url }).promise;
    }

    async function renderPage(pdf: PDFDocumentProxy, pageNumber: number, cssWidth: number): Promise<RenderTask> {
        const pdfPage = await pdf.getPage(pageNumber);
        const scale = cssWidth / pdfPage.getViewport({ scale: 1 }).width;
        const viewport = pdfPage.getViewport({ scale: scale * devicePixelRatio });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${cssWidth}px`;
        return pdfPage.render({ canvas, viewport });
    }
</script>

<div bind:clientWidth={width} class="flex justify-center bg-gray-50 px-6 py-8">
    {#if error}
        <p class="text-sm text-gray-600">Brontosound can't show this PDF: {error}</p>
    {/if}
    <canvas bind:this={canvas} class="max-w-full border border-gray-200 bg-white" class:hidden={!pdf}></canvas>
</div>
