const discord = require('discord.js');
const settings = require('./settings');
const audioQueue = require('./queue');
const tts = require('./ttsApi');

const client = new discord.Client();
const settingsFile = './config.json';
const manageGuildPermission = 'MANAGE_GUILD';
const commandLookupTable = {
    'ping': cmdPing,
    'config': cmdConfig,
    'join': cmdJoin,
    'leave': cmdLeave,
    'tts': cmdTts,
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

/**
 * Check if a message is a command the bot should execute
 * @param {String} msgContent The content of the current message
 */
function isCommand(msgContent) {
    return msgContent.startsWith(settings.getValue('prefix'));
}

/**
 * Get the command and arguments of the current message
 * @param {String} msgContent The content ofthe current message
 */
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

/**
 * Handle the ping command
 * @param {discord.Message} msg The current message
 */
function cmdPing(msg) {
    msg.channel.send('Pong!');
}

/**
 * Handle the config command
 * @param {discord.Message} msg The current message
 * @param {Array} args The given arguments
 */
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

/**
 * Handle the join command
 * @param {discord.Message} msg The current message
 */
function cmdJoin(msg) {
    // Check if Message comes from server
    if (!msg.guild) return;
    // Check if sender is connected to voice channel
    if (!msg.member.voice.channel) {
        msg.channel.send(`<@${msg.member.id}>, you're not in a voice channel`);
        return;
    }
    // Check if bot is connected to a voice channel
    if (inVoiceChannel) {
        msg.channel.send(`@${msg.member.displayName}, I'm already in a voice channel`);
        return;
    }
    // Check if we have permission to join and play audio
    const grantedPermissions = msg.member.voice.channel.permissionsFor(msg.client.user)
    if (!grantedPermissions.has('SPEAK') || !grantedPermissions.has('CONNECT')) {
        msg.channel.send(`@${msg.member.displayName}, I need join and speak permissions to this channel first!`);
        return;
    }

    let audioPlayer;
    msg.member.voice.channel.join().then(async (connection) => {
        currentVoiceChannel = msg.member.voice.channelID;
        inVoiceChannel = true;
        console.log('Connected to voice channel');
        /**
         * Wait until the end of the audio stream
         * @param {discord.StreamDispatcher} currentPlayer The current voice connection to the server
         */
        const waitUntilEnd = (currentPlayer) => {
            return new Promise((resolve) => {
                currentPlayer.on('end', () => resolve());
            });
        };

        while (inVoiceChannel) {
            const audioUrl = await audioQueue.getNext();
            if (!inVoiceChannel || audioUrl === undefined) break;
            audioPlayer = connection.play(audioUrl);
            await waitUntilEnd(audioPlayer);
        }
    });
}

/**
 * Handle the leave command
 * @param {discord.Message} msg The current message
 */
function cmdLeave(msg) {
    // Check if Message comes from server
    if (!msg.guild) return;
    // Check if sender is connected to voice channel
    if (!msg.member.voice.channel) {
        msg.channel.send(`<@${msg.member.id}>, you're not in a voice channel`);
        return;
    }
    // Check if bot is connected to a voice channel
    if (inVoiceChannel) {
        msg.channel.send(`@${msg.member.displayName}, I'm already in a voice channel`);
        return;
    }
    // Check if sender is in the same voice channel
    if (currentVoiceChannel !== msg.member.voice.channelID) {
        msg.channel.send(`@${msg.member.displayName}, we're not in the same voice channel`);
        return;
    }
    msg.member.voice.channel.leave();
    console.log('Left voice channel');
    inVoiceChannel = false;
    currentVoiceChannel = '';
    audioQueue.clearAndStop();
}

/**
 * Handle the tts command
 * @param {discord.Message} msg The current message
 * @param {Array} args The given arguments
 */
async function cmdTts(msg, args) {
    // Check if Message comes from server
    if (!msg.guild) return;
    // Check if sender is connected to voice channel
    if (!msg.member.voice.channel) {
        msg.channel.send(`<@${msg.member.id}>, you're not in a voice channel`);
        return;
    }
    // Check if bot is connected to a voice channel
    if (!inVoiceChannel) {
        msg.channel.send(`@${msg.member.displayName}, I'm not in a voice channel`);
        return;
    }
    // Check if sender is in the same voice channel
    if (currentVoiceChannel !== msg.member.voice.channelID) {
        msg.channel.send(`@${msg.member.displayName}, we're not in the same voice channel`);
        return;
    }
    // Check if the argument count is correct
    if (args.length < 2) {
        msg.channel.send('Invalid arguments for `tts` command');
        return;
    }
    
    const ttsUrl = await tts.getTTSUrl(args.splice(1, args.length - 1).join(' '), args[0]);
    audioQueue.push(ttsUrl);
}

settings.loadSettings(settingsFile);
client.login(settings.getValue('token'));