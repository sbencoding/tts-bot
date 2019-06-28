const puppeteer = require('puppeteer');
const queue = require('./queue');

const trsQueue = new queue.Queue();
let trsQueueRunning = false;

function getTextResult(langFrom, langTo, text) {
    return new Promise((resolve) => {
        if (!trsQueueRunning) {
            // Start queue listener if not running
            _loadTrs();
        }
        const url = `https://translate.google.com/#${langFrom}/${langTo}/${encodeURIComponent(text)}`;
        trsQueue.push({
            url,
            callback: (result) => resolve(result)
        });
    });
}

/**
 * Listen for new translations to compute
 */
async function _loadTrs() {
    trsQueueRunning = true;
    let browser = null;
    while (trsQueueRunning) {
        // Close browser if queue is empty
        if (trsQueue.length === 0) {
            await browser.close();
            browser = null;
        }
        const item = await trsQueue.getNext();
        if (browser == null) {
            // Launch browser if stopped
            browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        }

        const page = await browser.newPage();
        // Visit the page
        await page.goto(item.url);
        const translationSelector = '.translation span';
        try {
            await page.waitForSelector(translationSelector);
        } catch (error) {
            console.log(error);
            item.callback(undefined);
            continue;
        }
        
        // Get the resulting translation
        const result = await page.evaluate((selector) => {
            return document.querySelector(selector).innerText;
        }, translationSelector);
        item.callback(result);
        await page.close();
    }
}

module.exports = {
    getTextResult,
}