export function initMessageListener() {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === "GET_SCAN_RESULT") {
			if (window.myGuardScanResult) {
				sendResponse(window.myGuardScanResult);
			} else {
				sendResponse({ status: "pending" });
			}
		}
		return true;
	});
}
