export function showPopup(result: { threats: any[] }) {
	const isSafe = result.threats.length === 0;

	const popup = document.createElement("div");
	popup.style.position = "fixed";
	popup.style.top = "20px";
	popup.style.right = "20px";
	popup.style.zIndex = "9999";
	popup.style.backgroundColor = "#fff";
	popup.style.padding = "10px 15px";
	popup.style.border = "1px solid #ccc";
	popup.style.borderRadius = "8px";
	popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
	popup.style.fontFamily = "Arial, sans-serif";
	popup.style.fontSize = "14px";

	const text = document.createElement("p");
	text.textContent = isSafe
		? "Загроз не виявлено"
		: `Виявлено ${result.threats.length} загроз(и)`;
	text.style.color = isSafe ? "green" : "red";
	text.style.margin = "0 0 8px 0";

	popup.appendChild(text);
	document.body.appendChild(popup);

	setTimeout(() => {
		popup.remove();
	}, 5000);
}
