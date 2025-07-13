import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicesPath = path.join(__dirname, "services.json");
const outputPath = path.join(__dirname, "../public/ruleset.json");

const raw = await fs.readFile(servicesPath, "utf-8");
const data = JSON.parse(raw);

const rules = [];
let id = 1;
const maxRules = 30000;

const categories = data.categories;

for (const categoryName in categories) {
	const servicesArray = categories[categoryName]; // масив об'єктів

	for (const service of servicesArray) {
		const serviceName = Object.keys(service)[0];
		const domainsByHomepage = service[serviceName];

		for (const homepage in domainsByHomepage) {
			const domains = domainsByHomepage[homepage];

			for (const domain of domains) {
				if (id > maxRules) break;

				rules.push({
					id: id++,
					priority: 1,
					action: { type: "block" },
					condition: {
						urlFilter: domain,
						resourceTypes: ["script", "xmlhttprequest", "sub_frame"],
					},
				});
			}
		}
	}
}

await fs.writeFile(outputPath, JSON.stringify(rules, null, 2), "utf-8");

console.log(`✅ Створено ruleset.json з ${rules.length} правилами.`);
