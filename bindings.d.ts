export {};

declare global {
	const ORIGINATING_DOMAINS: string;
	const MY_SECRET: string;
	const myKVNamespace: KVNamespace;
}
