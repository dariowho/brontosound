export function arrayEquals<T>(a: Array<T>, b: Array<T>) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function pathJoin(...pathComponents){
    const separator = '/';
    var replace = new RegExp(separator+'{1,}', 'g');
    return pathComponents.join(separator).replace(replace, separator);
 }
