export function notImplemented(where: string): never {
    throw new Error(`Not implemented ${where}`)
}