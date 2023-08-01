// https://stackoverflow.com/questions/19377262/regex-for-youtube-url
const ytre = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)(?<videoId>[\w\-]+)(\S+)?/;

export interface YTVideoUrl {
    url: string
    id: string
}

/**
 * Return the first YT video URL that is matched in `str`, or null if no URL is found
 * 
 * @param str Any text that may contain a YT link
 * @returns The first YT video URL that is found in 'str', or 'null' if no url is found
 */
export function extractYTVideoUrl(str: string): YTVideoUrl | null {
    const match = str.match(ytre);
    if (! match) return null;
    let videoId = match.groups?.videoId;
    if (! videoId) return null;
    return {
        url: match[0],
        id: videoId
    }
}
