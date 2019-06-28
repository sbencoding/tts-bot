# TTS Bot
This is a bot made for discord hack week 2019.  
It can:
- Translate text and read the result in a voice channel
- Read a text in a voice channel
- Translate a text message

### Setup
First clone the project using `git clone`, then execute `npm install`.  
The bot uses `puppeteer`, a headless chrome API. Based on your environment, you might not have some dependencies required by `puppeteer`.  
You can install does dependencies by executing `sudo apt-get install $(cat puppeteer_deps.txt)` from the project directory.  

### Config
In order to hide the bot token, I could not include the original configuration file, but I included an example without the bot token.  
You need to get your own token and set it in the config.example.json file like:
```json
{
    "token":"YOUR BOT TOKEN HERE",
    "prefix":"!"
}
```
After you set the token, you need to rename the file to `config.json`.

### Usage
You can start the bot with the following command: `node index`, from the project directory.  
After that you can use `!help` to get a list of available commands and arguments.  

### Command arguments
The translate command (`!trs`) uses language codes for the origin and target language. The text translate (`!tr`) command uses the same codes.  
These codes follow the [ISO 639-1 format](https://en.wikipedia.org/wiki/ISO_639-1).  
The tts command (`!tts`) uses a TTS voice in the first argument. The voice can be one of the following voice names:
| Voice name | Voice language|
|------------|---------------|
|Zeina | Arabic|
|Nicole | Australian English|
|Russell | Australian English|
|Ricardo | Brazilian Portuguese|
|Vitoria | Brazilian Portuguese|
|Emma | British English|
|Amy | British English|
|Brian | British English|
|Chantal | Canadian French|
|Conchita | Castilian Spanish|
|Lucia | Castilian Spanish|
|Enrique | Castilian Spanish|
|Zhiyu | Chinese Mandarin|
|Naja | Danish|
|Mads | Danish|
|Lotte | Dutch|
|Ruben | Dutch|
|Mathieu | French|
|Celine | French|
|Lea | French|
|Hans | German|
|Marlene | German|
|Vicki | German|
|Karl | Icelandic|
|Dora | Icelandic|
|Raveena | Indian English|
|Aditi | Indian English|
|Bianca | Italian|
|Giorgio | Italian|
|Carla | Italian|
|Mizuki | Japanese|
|Takumi | Japanese|
|Seoyeon | Korean|
|Mia | Mexican Spanish|
|Liv | Norwegian|
|Maja | Polish|
|Jan | Polish|
|Jacek | Polish|
|Ewa | Polish|
|Cristiano | Portuguese|
|Ines | Portuguese|
|Carmen | Romanian|
|Maxim | Russian|
|Tatyana | Russian|
|Astrid | Swedish|
|Filiz | Turkish|
|Ivy | US English|
|Joanna | US English|
|Joey | US English|
|Justin | US English|
|Kendra | US English|
|Kimberly | US English|
|Matthew | US English|
|Salli | US English|
|Penelope | US Spanish|
|Miguel | US Spanish|
|Gwyneth | Welsh|
|Geraint | Welsh English|

The command requires values from the first column of the table.  