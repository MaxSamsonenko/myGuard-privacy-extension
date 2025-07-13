interface Threat {
	message: string;
	html: string;
}

interface ScanResult {
	url: string;
	threats: Threat[];
}

function extractDomain(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.hostname.replace("www.", "");
	} catch {
		if (url.startsWith("file://")) {
			return url.split("/").slice(-1)[0];
		}
		return url;
	}
}

function truncateUrl(url: string, maxLength = 30): string {
	return url.length > maxLength ? url.slice(0, maxLength) + "…" : url;
}

function renderScanResults(
	results: Record<string, ScanResult>,
	container: HTMLElement
) {
	container.innerHTML = "";

	if (Object.keys(results).length === 0) {
		container.innerHTML += "<p>Немає збережених перевірок.</p>";
		return;
	}

	const list = document.createElement("ul");

	for (const url in results) {
		const result = results[url];

		const label = url.startsWith("http")
			? extractDomain(url)
			: truncateUrl(url);

		const item = document.createElement("li");

		const button = document.createElement("button");
		button.textContent = label;
		button.style.display = "block";
		button.style.marginBottom = "4px";

		const threatList = document.createElement("ul");
		threatList.style.display = "none";

		result.threats.forEach((threat) => {
			const threatItem = document.createElement("li");
			threatItem.innerHTML = `<strong>${threat.message}</strong><br/><code>${threat.html}</code>`;
			threatList.appendChild(threatItem);
		});

		button.addEventListener("click", () => {
			const isVisible = threatList.style.display === "block";
			threatList.style.display = isVisible ? "none" : "block";
		});

		item.appendChild(button);
		item.appendChild(threatList);
		list.appendChild(item);
	}

	container.appendChild(list);
}

document.addEventListener("DOMContentLoaded", () => {
	const container = document.getElementById("definition-text");
	if (!container) return;

	const clearBtn = document.createElement("button");
	clearBtn.textContent = " Очистити історію";
	clearBtn.style.marginBottom = "10px";
	clearBtn.style.backgroundColor = "#f44336";
	clearBtn.style.color = "#fff";
	clearBtn.style.border = "none";
	clearBtn.style.padding = "8px";
	clearBtn.style.borderRadius = "4px";
	clearBtn.style.cursor = "pointer";

	clearBtn.addEventListener("click", () => {
		chrome.storage.local.remove("scanResultsBySite", () => {
			container.innerHTML = "<p>Історію очищено.</p>";
		});
		chrome.runtime.sendMessage({ type: "CLEAR_BADGE" });
	});

	container.parentElement?.insertBefore(clearBtn, container);

	// Перше завантаження
	chrome.storage.local.get("scanResultsBySite", (data) => {
		renderScanResults(data.scanResultsBySite || {}, container);
	});

	// Live-оновлення
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "local" && changes.scanResultsBySite) {
			const newValue = changes.scanResultsBySite.newValue || {};
			renderScanResults(newValue, container);
		}
	});
});
