import Puppeteer from "puppeteer";

const browser = await Puppeteer.launch();
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
    try {
        await page.goto(site);
        const hasSearchBar = await page.evaluate(() => {
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
                    // enter some dummy data then emulate a form submit
                    input.value = "test search";
                    const enter = new KeyboardEvent('keydown', {
                        bubbles: true, cancelable: true, keyCode: 13
                    });
                    input.dispatchEvent(enter);
                    input.form?.submit();
                    return true;
                }
            };
            return false;
        });
        if (hasSearchBar) {
            console.log(`${site}: Found a search bar. Fetching URL... `)
            await page.waitForNavigation({waitUntil: "load"});
            console.log(`${site}: ${page.url()}\n`);
        } else {
            console.log(`${site}: No search bar found.\n`)
        }
    }
    catch (e) {
        console.log(`${site} An error occured when accessing the site. \n${e}\n`);
    }
};

await browser.close();
