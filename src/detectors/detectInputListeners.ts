import type { Threat } from "../content/types";

export function detectInputListeners(): Threat[] {
	const threats: Threat[] = [];

	document.querySelectorAll("input").forEach((input) => {
		if (typeof (input as HTMLInputElement).oninput === "function") {
			threats.push({
				message: "Поле має призначену обробку події oninput",
				html: input.outerHTML,
			});
		}
	});

	const inlineScripts = Array.from(document.querySelectorAll("script"))
		.map((el) => el.textContent || "")
		.join("\n");

	if (
		inlineScripts.includes('.addEventListener("input"') ||
		inlineScripts.includes(".addEventListener('input'")
	) {
		threats.push({
			message: "Виявлено прослуховування input подій у JS",
			html: 'Скрипт містить .addEventListener("input")',
		});
	}

	document.querySelectorAll("script[src]").forEach((script) => {
		const src = script.getAttribute("src") || "";
		if (!src.includes(location.hostname)) {
			threats.push({
				message: "Підключено сторонній скрипт (зовнішній src)",
				html: script.outerHTML,
			});
		}
	});

	return threats;
}
