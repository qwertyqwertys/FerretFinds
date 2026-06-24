const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 1. CONFIGURATION MATRIX: Map out your favorite source sites
const SOURCE_SITES = [
    {
        name: "The Freebie Guy DG",
        url: "https://thefreebieguy.com/dollar-general-penny-list-for-june-23-2026/",
        selectors: {
            itemRow: ".entry-content p, .entry-content li",
            brand: "DG"
        }
    },
    {
        name: "The Freebie Guy DT",
        url: "https://thefreebieguy.com/dollar-tree-penny-items-guide/",
        selectors: {
            itemRow: ".entry-content p, .entry-content li",
            brand: "DT"
        }
    }
];

const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function runMasterScraper() {
    let masterCatalog = [];
    const currentTime = new Date().getTime(); // Capture current time for all items

    console.log("🚀 Starting Multi-Site Scraping Run...");

    for (const site of SOURCE_SITES) {
        try {
            console.log(`📡 Fetching items from: ${site.name}...`);
            const { data } = await axios.get(site.url, { headers: REQUEST_HEADERS });
            const $ = cheerio.load(data);
            
            $(site.selectors.itemRow).each((index, element) => {
                const rawText = $(element).text().trim();

                if (rawText.length > 10 && /\d+/.test(rawText)) {
                    const cleanName = rawText.replace(/upc|sku|penny/gi, '').replace(/[:\-\d]/g, '').trim();
                    const extractedNumbers = rawText.match(/\d{8,12}/g);

                    if (extractedNumbers) {
                        masterCatalog.push({
                            store: site.brand,
                            name: cleanName || "Clearance General Merchandise",
                            upc: extractedNumbers[0] || "000000000000",
                            sku: extractedNumbers[0].length === 8 ? extractedNumbers[0] : "",
                            added: "Automated Feed Sync",
                            originalPrice: 3.00,
                            clearancePrice: 0.01,
                            isPenny: true,
                            dept: "Scraped Deal",
                            timestamp: currentTime // 🌟 Added timestamp for "New!" badge logic
                        });
                    }
                }
            });
        } catch (error) {
            console.error(`❌ Failed parsing ${site.name}:`, error.message);
        }
    }

    fs.writeFileSync('./live-deals.json', JSON.stringify(masterCatalog, null, 2));
    console.log(`✅ Success! Saved ${masterCatalog.length} total items into live-deals.json`);
}

runMasterScraper();
