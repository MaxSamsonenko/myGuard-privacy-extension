import type { Threat } from "../content/types";

export function detectDomHarvesting(): Threat[] {
	const threats: Threat[] = [];

	const inlineScripts = Array.from(
		document.querySelectorAll("script:not([src])")
	);

	inlineScripts.forEach((script, index) => {
		const content = (script.textContent || "").toLowerCase();

		let readFlags = 0;
		let sendFlags = 0;

		if (
			content.includes("input.value") ||
			content.includes(".value") ||
			content.includes("textarea.value") ||
			content.includes("select.value") ||
			content.includes(".textcontent") ||
			content.includes(".innertext")
		) {
			readFlags++;
		}

		if (
			content.includes("fetch(") ||
			content.includes("xmlhttprequest") ||
			content.includes("formdata") ||
			content.includes(".send(") ||
			content.includes("navigator.sendbeacon")
		) {
			sendFlags++;
		}

		if (readFlags > 0 && sendFlags > 0) {
			threats.push({
				message: `Виявлено можливе DOM-зчитування та відправку даних (скрипт №${
					index + 1
				})`,
				html: script.textContent?.slice(0, 300) + "...",
			});
		}
	});

	return threats;
}
