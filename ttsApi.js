const request = require('request');
const puppeteer = require('puppeteer');
const queue = require('./queue');

const trsQueue = new queue.Queue();
let trsQueueRunning = false;

/**
 * Get the mp3 url of the resulting audio from the text
 * @param {String} text The text to convert to audio
 * @param {String} language The language to use
 */
function getTTSUrl(text, language) {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: 'https://ttsmp3.com/makemp3.php',
                form: {
                    msg: text,
                    lang: language,
                    source: 'ttsmp3',
                }
            }, function (err, httpResponse) {
                if (err) {
                    reject(err);
                }
                let url = `https://ttsmp3.com/dlmp3.php?mp3=${JSON.parse(httpResponse.body).MP3}`;
                resolve(url);
            }
        );
    });
}

/**
 * Get the audio url of the translated text
 * @param {String} langFrom The code of the language to translate from
 * @param {String} langTo The code of the language to translate to
 * @param {String} text The text to translate
 */
function getTRSUrl(langFrom, langTo, text) {
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
    })
}

/**
 * Listen for new translations to get the audio of
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
        page.setRequestInterception(true);
        page.on('request', (req) => {
            let url = req.url();
            if (url.indexOf('translate_tts?') > -1) {
                // Intercept the audio url
                item.callback(url);
                req.abort('aborted');
                page.close();
            }
            else req.continue();
        });
        // Visit the page
        await page.goto(item.url);
        const ttsSelector = '.res-tts';
        try {
            await page.waitForSelector(ttsSelector);
        } catch (error) {
            console.log(error);
            item.callback(undefined);
            continue;
        }
        
        // Click the tts button
        await page.click(ttsSelector);
    }
}

module.exports = {
    getTTSUrl,
    getTRSUrl,
}