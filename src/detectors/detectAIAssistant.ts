import { Threat } from "../content/types";
const suspiciousDomains = [
	".ai",
	"openai.com",
	"anthropic.com",
	"cohere.ai",
	"character.ai",
	"forefront.ai",
	"poe.com",
	"gptapi.io",
];

function isSuspiciousUrl(url: string): boolean {
	return suspiciousDomains.some((domain) => url.includes(domain));
}
export function detectAIAssistants(): Threat[] {
	const threats: Threat[] = [];

	//fetch
	if ((window as any).fetch) {
		const originalFetch = window.fetch;
		(window as any).fetch = function (...args: any[]) {
			const [url, options] = args;
			try {
				const body =
					typeof options?.body === "string"
						? options.body
						: JSON.stringify(options?.body || "");
				if (isSuspiciousUrl(url) && body.length > 100) {
					threats.push({
						message: "Виявлено передачу великих даних через fetch",
						html: `fetch('${url}', {...})`,
					});
				}
			} catch {}
			return originalFetch.call(this, url, options);
		};
	}

	//XMLHttpRequest
	const originalSend = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function (body) {
		try {
			const url = (this as any)._url || "";
			if (
				isSuspiciousUrl(url) &&
				typeof body === "string" &&
				body.length > 100
			) {
				threats.push({
					message: "Виявлено передачу великих даних через XMLHttpRequest",
					html: `xhr.send(...) to ${url}`,
				});
			}
		} catch {}
		return originalSend.call(this, body);
	};

	//sendBeacon
	const originalBeacon = navigator.sendBeacon;
	navigator.sendBeacon = function (url: string, data?: BodyInit | null) {
		try {
			const body = typeof data === "string" ? data : "";
			if (isSuspiciousUrl(url) && body.length > 100) {
				threats.push({
					message: "sendBeacon відправляє великі дані до AI-домену",
					html: `navigator.sendBeacon('${url}', ...)`,
				});
			}
		} catch {}
		return originalBeacon.call(this, url, data);
	};

	//WebSocket
	const originalWebSocket = window.WebSocket;
	(window as any).WebSocket = function (
		url: string,
		protocols?: string | string[]
	) {
		const socket = protocols
			? new originalWebSocket(url, protocols)
			: new originalWebSocket(url);

		if (isSuspiciousUrl(url)) {
			threats.push({
				message: "Встановлено WebSocket-зʼєднання з AI-доменом",
				html: `new WebSocket("${url}")`,
			});
		}

		return socket;
	};

	// iframe
	document.querySelectorAll("iframe").forEach((iframe) => {
		const src = iframe.getAttribute("src") || "";
		if (isSuspiciousUrl(src)) {
			threats.push({
				message: "Виявлено iframe з AI-домену",
				html: iframe.outerHTML.slice(0, 200) + "...",
			});
		}
	});

	return threats;
}
