import type { ScanResult } from "./content/types";

let badgeCleared = false;

chrome.runtime.onMessage.addListener(
	(message: { type: string; payload?: any }, _sender, _sendResponse) => {
		if (message.type === "SAVE_SCAN_RESULT") {
			const payload: ScanResult = message.payload;

			chrome.storage.local.get("scanResultsBySite", (data) => {
				const allResults = data.scanResultsBySite || {};
				allResults[payload.url] = payload;

				chrome.storage.local.set({ scanResultsBySite: allResults }, () => {
					console.log("[myGuard] Scan saved for site:", payload.url);
				});
			});
		}

		if (message.type === "UPDATE_BADGE") {
			const { threatCount } = message.payload || {};

			if (!badgeCleared) {
				chrome.action.setBadgeText({
					text: threatCount && threatCount > 0 ? threatCount.toString() : "",
				});

				chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
			}
		}

		if (message.type === "CLEAR_BADGE") {
			chrome.action.setBadgeText({ text: "" });
			console.log("[myGuard] Badge cleared");
		}

		return true;
	}
);

chrome.runtime.onInstalled.addListener(() => {
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

	chrome.storage.local.get("scanResult", (data) => {
		if (!badgeCleared) {
			const threats = Array.isArray(data.scanResult?.threats)
				? data.scanResult.threats.length
				: 0;

			chrome.action.setBadgeText({
				text: threats > 0 ? threats.toString() : "",
			});

			chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
		}
	});
});

chrome.action.onClicked.addListener(async (tab) => {
	if (!tab.id) return;

	console.log("[myGuard] Sidepanel clicked");

	chrome.action.setBadgeText({ text: "" });

	await chrome.sidePanel.setOptions({
		tabId: tab.id,
		path: "sidepanel.html",
		enabled: true,
	});

	await chrome.sidePanel.open({ tabId: tab.id });
});
