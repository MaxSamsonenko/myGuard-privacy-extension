import type { Threat } from "../content/types";

export function detectFingerprinting(): Threat[] {
	const threats: Threat[] = [];

	// 🔍 Перевірка canvas fingerprinting
	if (
		HTMLCanvasElement.prototype.toDataURL
			.toString()
			.includes("[native code]") === false
	) {
		console.trace("🔍 Fingerprinting triggered by: canvas.toDataURL");
		threats.push({
			message:
				"⚠️ Спроба зчитати Canvas (toDataURL) — можливий canvas fingerprinting",
			html: "<canvas> метод toDataURL був змінений",
		});
	}

	if (
		HTMLCanvasElement.prototype.getContext
			.toString()
			.includes("[native code]") === false
	) {
		console.trace("🔍 Fingerprinting triggered by: canvas.getContext");
		threats.push({
			message:
				"⚠️ Canvas getContext() модифіковано — можливе зчитування графічних даних",
			html: "<canvas> метод getContext був змінений",
		});
	}

	// 🔍 Audio fingerprinting
	if (
		typeof window.AudioContext !== "undefined" ||
		typeof (window as any).webkitAudioContext !== "undefined"
	) {
		console.trace("🔍 Fingerprinting triggered by: AudioContext");
		threats.push({
			message:
				"⚠️ Виявлено використання AudioContext — можливе аудіо-фінгерпринтинг",
			html: "AudioContext або webkitAudioContext активний",
		});
	}

	// 🔍 WebGL
	try {
		const canvas = document.createElement("canvas");
		if (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) {
			console.trace("🔍 Fingerprinting triggered by: WebGL getContext");
			threats.push({
				message: "⚠️ Виявлено WebGL API — можливий WebGL fingerprinting",
				html: "",
			});
		}
	} catch (_) {}

	// 🔍 Hardware / Fonts
	if (
		navigator.plugins?.length > 0 ||
		navigator.mimeTypes?.length > 0 ||
		"hardwareConcurrency" in navigator ||
		"deviceMemory" in navigator
	) {
		console.trace(
			"🔍 Fingerprinting triggered by: navigator.hardwareConcurrency / deviceMemory / plugins"
		);
		threats.push({
			message:
				"⚠️ Зчитуються дані системи — можливий hardware або font fingerprinting",
			html: "navigator.plugins / hardwareConcurrency / deviceMemory",
		});
	}

	return threats;
}
