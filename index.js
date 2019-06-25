const discord = require('discord.js');
const client = new discord.Client();
const settings = require('./settings');

const settingsFile = './config.json';
const commandLookupTable = {
    'ping': cmdPing,
};

client.on('ready', () => {
    console.log('TTS Bot is connected to the server');
});

client.on('message', (msg) => {
    if (!isCommand(msg.content)) return;
    const {command, args} = parseCommand(msg.content);
    const cmdHandler = commandLookupTable[command];
    if (cmdHandler === undefined) {
        // Command doesn't exist
        console.log('Error, command doesn\'t exist');
        msg.channel.send(`No command '${command}' found!`);
    } else {
        // Command exists, call the handler
        cmdHandler(msg, args);
    }
});

function isCommand(msgContent) {
    return msgContent.startsWith(settings.getValue('prefix'));
}

function parseCommand(msgContent) {
    const cmdParts = msgContent.substring(settings.getValue('prefix').length);
    const commandIndex = cmdParts.indexOf(' ');
    if (commandIndex < 0) {
        // Command without arguments
        return {
            command: cmdParts,
            args: [],
        }
    } else {
        // Command with arguments
        const commandPart = cmdParts.substring(0, commandIndex);
        const argumentPart = cmdParts.substring(commandIndex + 1);
        const commandArguments = argumentPart.split(' ');
        return {
            command: commandPart,
            args: commandArguments,
        }
    }
}

function cmdPing(msg) {
    msg.channel.send('Pong!');
}

settings.loadSettings(settingsFile);
client.login(settings.getValue('token'));