const discord = require('discord.js');
const settings = require('./settings');

const client = new discord.Client();
const settingsFile = './config.json';
const manageGuildPermission = 'MANAGE_GUILD';
const commandLookupTable = {
    'ping': cmdPing,
    'config': cmdConfig,
    'join': cmdJoin,
    'leave': cmdLeave,
};

let inVoiceChannel = false;
let currentVoiceChannel = '';

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

function cmdConfig(msg, args) {
    if (args.length === 0) {
        // 0 Arguments given to the config command
        msg.channel.send('Error, the `config` command takes either 2 or 3 arguments, but 0 was given!');
        return;
    }
    // Either get or set
    const mode = args[0];
    if (mode === 'get') {
        // Get a value from the config file
        if (args.length !== 2) {
            // Name of the option not given, or too many arguments
            msg.channel.send('Error, `config get` takes one argument, the name of the setting to get!');
            return;
        }
        const val = settings.getValue(args[1]);
        msg.channel.send(`The value of \`${args[1]}\` is \`${val}\``);
    } else if (mode === 'set') {
        // Set a value in the config file
        if (args.length !== 3) {
            // Name and value of the option not given, or too many arguments
            msg.channel.send('Error, `config set` takes two arguments, the name of the option and the value to set it to!');
            return;
        }
        // Check permission of the sender (Manage Guild)
        const user = msg.member;
        const canConfig = user.permissions.has(manageGuildPermission);
        if (canConfig) {
            // Sender has permission
            const configName = args[1];
            const configValue = args[2];
            settings.setValue(configName, configValue);
            msg.channel.send(`Success! Set \`${configName}\` to \`${configValue}\``);
            settings.saveSettings(settingsFile);
        } else {
            // Insufficient permissions
            msg.channel.send('Sorry, you don\'t have the required permissions to configure this bot.');
        }
    } else {
        // Mode is invalid for config command
        msg.channel.send('Error, invalid mode for `config` command');
    }
}

function cmdJoin(msg) {
    if (!msg.guild) return;
    if (!msg.member.voiceChannel) {
        msg.channel.send(`<@${msg.member.id}>, you're not in a voice channel`);
        return;
    }
    if (inVoiceChannel) {
        msg.channel.send(`@${msg.member.displayName}, I'm already in a voice channel`);
        return;
    }

    msg.member.voiceChannel.join().then(connection => {
        currentVoiceChannel = msg.member.voiceChannel.id;
        inVoiceChannel = true;
        console.log('Connected to voice channel');
    })
}

function cmdLeave(msg) {
    if (!msg.guild) return;
    if (!msg.member.voiceChannel) {
        msg.channel.send(`<@${msg.member.id}>, you're not in a voice channel`);
        return;
    }
    if (!inVoiceChannel) {
        msg.channel.send(`@${msg.member.displayName}, I'm not in a voice channel`);
        return;
    }
    if (currentVoiceChannel !== msg.member.voiceChannel.id) {
        msg.channel.send(`@${msg.member.displayName}, we're not in the same voice channel`);
        return;
    }
    msg.member.voiceChannel.leave();
    inVoiceChannel = false;
    currentVoiceChannel = '';
    console.log('Left voice channel');
}

settings.loadSettings(settingsFile);
client.login(settings.getValue('token'));