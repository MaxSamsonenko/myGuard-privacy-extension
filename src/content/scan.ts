import type { ScanResult, Threat } from "./types";
import { levenshtein } from "../utils/levenshtein";
import { highlightThreatForms } from "../utils/highlightThreatForms";
import { detectCookiesTrackers } from "../detectors/detectCookiesTrackers";
import { detectInputListeners } from "../detectors/detectInputListeners";
import { detectKeyLoggers } from "../detectors/detectKeylogger";
import { detectDomHarvesting } from "../detectors/detectDOMHarvesting";
import { detectHistorySniffing } from "../detectors/detectHistorySniffing";
import { detectFingerprinting } from "../detectors/detectFingerPrinting";
import { detectAIAssistants } from "../detectors/detectAIAssistant";

export async function scanPage(): Promise<ScanResult> {
	const threats: Threat[] = [];
	const hostname = window.location.hostname.replace(/^www\./, "");
	const isLocalhost =
		hostname === "localhost" || hostname.endsWith(".localhost");
	const isSiteSecure = window.location.protocol === "https:" || isLocalhost;

	const forms = document.querySelectorAll("form");
	let suspiciousFormsCount = 0;

	forms.forEach((form) => {
		const inputs = form.querySelectorAll(
			'input[type="email"], input[type="password"], input[name="token"], input[name="ssn"], input[name="card"], input[name="tel"], input[name="id"]'
		);

		const action = form.getAttribute("action");
		const isFormSecure =
			(action && action.startsWith("https")) || (!action && isSiteSecure);

		// Загроза — незахищена форма з чутливими полями
		if (!isFormSecure && inputs.length > 0) {
			threats.push({
				message: "Форма з чутливими даними без HTTPS-захисту",
				html: form.outerHTML.slice(0, 200) + "...",
			});
		}

		// Підозрілі поля — об'єднано в один загальний запис
		const suspiciousInputs = form.querySelectorAll(
			'input[name*="token"], input[name*="ssn"], input[name*="id"], input[name*="card"]'
		);
		if (suspiciousInputs.length > 0) {
			suspiciousFormsCount++;
		}

		// Форма має підозрілу логіку відправки
		const onSubmit = form.getAttribute("onsubmit");
		if (onSubmit && /fetch|XMLHttpRequest/.test(onSubmit)) {
			threats.push({
				message: "Форма використовує JavaScript для відправки (onsubmit)",
				html: form.outerHTML.slice(0, 200) + "...",
			});
		}
	});

	if (suspiciousFormsCount > 0) {
		threats.push({
			message: `Виявлено ${suspiciousFormsCount} форм(и) з підозрілими полями`,
			html: "Можливе збирання критичних даних (token, ssn, id, card).",
		});
	}

	// Перевірка домену на фішинг (Levenshtein)
	const knownDomains = [
		"facebook.com",
		"google.com",
		"paypal.com",
		"amazon.com",
		"apple.com",
		"instagram.com",
		"microsoft.com",
		"netflix.com",
		"linkedin.com",
		"github.com",
		"dropbox.com",
		"bankofamerica.com",
	];

	knownDomains.forEach((known) => {
		const distance = levenshtein(hostname, known);
		if (distance > 0 && distance <= 2) {
			threats.push({
				message: `⚠️ Потенційно фішинговий домен: схожий на ${known}`,
				html: `Поточний домен: ${hostname}`,
			});
		}
	});

	const trackerThreats = detectCookiesTrackers() || [];
	trackerThreats.forEach((msg) =>
		threats.push({
			message: msg,
			html: document.documentElement.outerHTML.slice(0, 200) + "...",
		})
	);

	const domThreats = detectInputListeners();
	console.log("domthreats:", domThreats);
	threats.push(...domThreats);

	const fingerprintingThreats = detectFingerprinting();
	console.log("fingerprintingThreats:", fingerprintingThreats);
	// console.trace("🔍 Fingerprinting triggered by:", methodName);
	threats.push(...fingerprintingThreats);

	const keyloggerThreats = await detectKeyLoggers();
	console.log("keyloggerThreats:", keyloggerThreats);

	threats.push(...keyloggerThreats);

	const domHarvestingThreats = detectDomHarvesting();
	console.log("domHarvestingThreats:", domHarvestingThreats);
	threats.push(...domHarvestingThreats);

	const historyLeaks = detectHistorySniffing();
	console.log("historyLeaks:", historyLeaks);
	threats.push(...historyLeaks);

	const aiThreats = detectAIAssistants();
	console.log("aiThreats:", aiThreats);
	threats.push(...aiThreats);

	const result: ScanResult = {
		url: window.location.href,
		threats,
	};

	window.myGuardScanResult = result;

	chrome.runtime.sendMessage({ type: "SAVE_SCAN_RESULT", payload: result });
	chrome.runtime.sendMessage({
		type: "UPDATE_BADGE",
		payload: { threatCount: threats.length },
	});
	highlightThreatForms(threats);
	console.log("[myGuard] Scan complete:", result);
	return result;
}
