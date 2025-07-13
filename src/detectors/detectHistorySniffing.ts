import type { Threat } from "../content/types";

export function detectHistorySniffing(): Threat[] {
	const threats: Threat[] = [];

	// 🔍 Шукаємо доступ до стилів :visited
	const inlineScripts = Array.from(document.querySelectorAll("script"))
		.map((el) => el.textContent || "")
		.join("\n");

	if (
		inlineScripts.includes("getComputedStyle") &&
		inlineScripts.includes(":visited")
	) {
		threats.push({
			message:
				"⚠️ Можлива спроба зчитування стилів :visited для перевірки історії",
			html: "Скрипт містить виклик getComputedStyle + ':visited'",
		});
	}

	// 🔍 Пошук iframe із підозрілим CSS або малою розмірністю
	document.querySelectorAll("iframe").forEach((iframe) => {
		const src = iframe.getAttribute("src") || "";
		const suspiciousSize =
			(iframe.width && Number(iframe.width) < 5) ||
			(iframe.height && Number(iframe.height) < 5);

		if (src === "about:blank" || suspiciousSize) {
			threats.push({
				message:
					"⚠️ Виявлено iframe, який потенційно використовується для sniffing-атаки",
				html: iframe.outerHTML,
			});
		}
	});

	// 🔍 Стилі з використанням :visited
	const styles = Array.from(document.querySelectorAll("style"))
		.map((el) => el.textContent || "")
		.join("\n");

	if (styles.includes(":visited")) {
		threats.push({
			message: "⚠️ CSS містить селектори :visited — можливе зчитування історії",
			html: ":visited в <style>",
		});
	}

	return threats;
}
