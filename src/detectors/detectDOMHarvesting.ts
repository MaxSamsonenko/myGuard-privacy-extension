import type { Threat } from "../content/types";

export function detectDomHarvesting(): Threat[] {
	const threats: Threat[] = [];

	// 🔍 Збираємо весь inline JavaScript
	const inlineScripts = Array.from(
		document.querySelectorAll("script:not([src])")
	);

	inlineScripts.forEach((script, index) => {
		const content = (script.textContent || "").toLowerCase();

		let readFlags = 0;
		let sendFlags = 0;

		// 🧠 Підозра на зчитування DOM
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

		// 📤 Підозра на передачу даних
		if (
			content.includes("fetch(") ||
			content.includes("xmlhttprequest") ||
			content.includes("formdata") ||
			content.includes(".send(") ||
			content.includes("navigator.sendbeacon")
		) {
			sendFlags++;
		}

		// Якщо є і читання, і передача — підозра на harvesting
		if (readFlags > 0 && sendFlags > 0) {
			threats.push({
				message: `⚠️ Виявлено можливе DOM-зчитування та відправку даних (скрипт №${
					index + 1
				})`,
				html: script.textContent?.slice(0, 300) + "...",
			});
		}
	});

	return threats;
}
