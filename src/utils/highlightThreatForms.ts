interface Threat {
	message: string;
	html: string;
}

export function highlightThreatForms(threats: Threat[]): void {
	const style = document.createElement("style");
	style.textContent = `
		.myguard-threat-form {
			outline: 2px dashed red !important;
			background-color: rgba(255, 0, 0, 0.05) !important;
			transition: all 0.3s ease;
		}
	`;
	document.head.appendChild(style);

	threats.forEach((threat) => {
		const fragment = threat.html.slice(0, 100); // Унікальна частина HTML
		document.querySelectorAll("form").forEach((form) => {
			if (form.outerHTML.includes(fragment)) {
				form.classList.add("myguard-threat-form");
				form.setAttribute("title", threat.message);
			}
		});
	});
}
