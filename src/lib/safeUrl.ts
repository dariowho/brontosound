const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * `url` if user content may link to it: relative, http(s), mailto or tel. Else undefined, so `javascript:` and `data:`
 * URLs never become links. Parsed as browsers parse it, so variants like ` JaVa\tscript:` are caught too.
 */
export function safeUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    try {
        return SAFE_PROTOCOLS.includes(new URL(url, 'http://relative.invalid').protocol) ? url : undefined;
    } catch {
        return undefined;
    }
}
