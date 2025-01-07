export function toBase64(bytes: Uint8Array<ArrayBufferLike>): string {
	return btoa(String.fromCharCode(...bytes));
}
export function fromBase64(str: string): Uint8Array {
	return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}