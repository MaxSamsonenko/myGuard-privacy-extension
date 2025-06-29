chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "UPDATE_BADGE") {
		const { threatCount } = message.payload;

		if (threatCount > 0) {
			chrome.action.setBadgeText({ text: threatCount.toString() });
			chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
		} else {
			chrome.action.setBadgeText({ text: "" });
		}
	}
});
