export {};

declare global {
	interface Window {
		myGuardScanResult?: {
			url: string;
			threats: Array<{ message: string; html: string }>;
		};
		Levenshtein: {
			get: (a: string, b: string) => number;
		};
	}
}

export interface Threat {
	message: string;
	html: string;
}
export interface ScanResult {
	url: string;
	threats: Threat[];
}
