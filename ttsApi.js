const request = require('request');

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

module.exports = {
    getTTSUrl,
}