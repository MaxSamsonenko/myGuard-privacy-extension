import { scanPage } from "./scan";
import { showPopup } from "./popup";
import { initMessageListener } from "./listener";

window.addEventListener("load", () => {
	setTimeout(async () => {
		const result = await scanPage();
		showPopup(result);
	}, 1000);
});
initMessageListener();
