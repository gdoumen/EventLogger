export const MAX_DEPTH = 3;

export function isFunc(o:any):boolean {
    return (typeof o === 'function')
}

export function isClass(o:any):boolean {
    return (isFunc(o) && o.prototype!==undefined && o.prototype.constructor!==undefined)
}

export function isSymbol(o:any):boolean {
    return (typeof o === 'symbol');
}

export default {}