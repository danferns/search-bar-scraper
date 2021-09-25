import Puppeteer from "puppeteer";

const SEARCH_STRING = "test search";

const browser = await Puppeteer.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://moz.com/top500');

const topSites = await page.evaluate(() => {
    const elements = document.querySelectorAll("td > a");
    let hrefs = [];
    elements.forEach(a => hrefs.push(a.href));
    return hrefs;
});

console.log(`Fetched top ${topSites.length} sites.`);

for (const site of topSites) {
    const siteTab = await browser.newPage();
    try {
        await siteTab.goto(site);
        const searchBar = await siteTab.evaluate(() => {
            const inputs = document.querySelectorAll("input");
            for (const input of inputs) {
                const testStrings = [
                    input.type,
                    input.placeholder,
                    input.id,
                    input.className,
                    input.ariaLabel,
                    input.title
                ];
                let isSearchBox = false;

                for (let string of testStrings) {
                    string = string?.toLowerCase();
                    if (string?.includes("search")) {
                        // we likely found the search box
                        isSearchBox = true;
                        break;
                    }
                };

                if (isSearchBox) {
                    let query = "input";
                    if (input.id) query += "#" + input.id;
                    input.classList.forEach(cls => { query += "." + cls });
                    // if (input.type) query += `[type='${input.type}']`;
                    if (input.placeholder) query += `[placeholder='${input.placeholder}']`;
                    if (input.ariaLabel) query += `[aria-label='${input.ariaLabel}']`;

                    return query;
                }
            };
            return false;
        });

        if (searchBar) {
            console.log(`${site}: Found a search bar. Fetching URL...`)
            await siteTab.focus(searchBar);
            await siteTab.keyboard.type(SEARCH_STRING);
            const mainUrl = siteTab.url();
            await siteTab.keyboard.press('Enter');
            try {
                await Promise.all([
                    siteTab.keyboard.press('Enter'),
                    siteTab.waitForNavigation({ waitUntil: "load", timeout: 5000 })
                ]);
            } catch {
                await Promise.all([
                    siteTab.evaluate((query) => {
                        document.querySelector(query).form?.submit();
                    }, searchBar),
                    siteTab.waitForNavigation({ waitUntil: "load", timeout: 5000 })
                ]);
            }
            const url = siteTab.url();
            console.log(`${site}: ${url}\n`);
        } else {
            console.log(`${site}: No search bar found.\n`);
        }
        await siteTab.close();
    } catch (e) {
        console.log(`${site} An error occured when accessing the site. \n${e}\n`);
        await siteTab?.close();
    }
};

await browser.close();
