import { useEffect, useState } from "react";

type Threat = {
	message: string;
	html: string;
};

type ScanResult = {
	url: string;
	threats: Threat[];
};

function App() {
	const [result, setResult] = useState<ScanResult | null>(null);

	useEffect(() => {
		chrome.action.setBadgeText({ text: "" });
		chrome.storage.local.get("scanResult", (data) => {
			if (data.scanResult) {
				setResult(data.scanResult);
			}
		});
	}, []);

	if (!result) {
		return <p>Завантаження...</p>;
	}

	const isSafe = result.threats.length === 0;

	return (
		<div style={{ padding: "16px", fontFamily: "Arial" }}>
			<h2>Результати перевірки</h2>
			<p>
				<strong>Сторінка:</strong> {result.url}
			</p>
			<p style={{ color: isSafe ? "green" : "red" }}>
				{isSafe
					? "✅ Загроз не виявлено"
					: `⚠️ Виявлено ${result.threats.length} загроз(и)`}
			</p>

			{!isSafe && (
				<ul>
					{result.threats.map((threat, index) => (
						<li key={index} style={{ marginBottom: "12px" }}>
							<strong>{threat.message}</strong>
							<pre
								style={{
									background: "#f4f4f4",
									padding: "8px",
									borderRadius: "4px",
									overflowX: "auto",
								}}
							>
								{threat.html}
							</pre>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default App;
