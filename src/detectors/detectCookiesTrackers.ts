//

export function detectCookiesTrackers(): string[] {
	const threats: string[] = [];

	if (document.cookie && document.cookie.length > 0) {
		threats.push("Сторінка встановила cookies — можливо для відстеження.");
	}

	const knownTrackers = [
		"google-analytics.com",
		"googletagmanager.com",
		"facebook.net",
		"hotjar.com",
		"doubleclick.net",
		"mixpanel.com",
		"segment.io",
		"cloudflareinsights.com",
	];

	const scripts = Array.from(
		document.querySelectorAll("script[src]")
	) as HTMLScriptElement[];

	for (const script of scripts) {
		if (knownTrackers.some((tracker) => script.src.includes(tracker))) {
			threats.push(`Виявлено сторонній трекер: ${script.src}`);
		}
	}

	return threats;
}
