import type { Threat } from "../content/types";

export async function detectKeyLoggers(): Promise<Threat[]> {
	const threats: Threat[] = [];
	let detectedType: string[] = [];

	const markDetected = (type: string) => {
		if (!detectedType.includes(type)) {
			detectedType.push(type);
		}
	};

	// Proxy addEventListener
	const originalAddEventListener = EventTarget.prototype.addEventListener;
	EventTarget.prototype.addEventListener = function (type, listener, options) {
		if (["keydown", "keypress", "keyup"].includes(type)) {
			markDetected(type);
		}
		return originalAddEventListener.call(this, type, listener, options);
	};

	// Proxy onkeydown / onkeypress / onkeyup
	["onkeydown", "onkeypress", "onkeyup"].forEach((prop) => {
		[document, window].forEach((target) => {
			let original: any = null;
			Object.defineProperty(target, prop, {
				set(value) {
					const type = prop.replace("on", "");
					markDetected(type);
					original = value;
				},
				get() {
					return original;
				},
				configurable: true,
			});
		});
	});

	await new Promise((r) => setTimeout(r, 1000));

	if (detectedType.length > 0) {
		threats.push({
			message: "🛑 Виявлено підозру на кейлогер (прослуховування клавіш)",
			html: `Сторінка слухає події: ${detectedType.join(", ")}`,
		});
	}

	return threats;
}
