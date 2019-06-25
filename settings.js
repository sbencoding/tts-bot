const fs = require('fs');
let settings;

function loadSettings(settingsPath) {
    const fileContent = fs.readFileSync(settingsPath);
    settings = JSON.parse(fileContent);
}

function saveSettings(settingsPath) {
    const fileContent = JSON.stringify(settings);
    fs.writeFileSync(settingsPath, fileContent);   
}

function getValue(name) {
    return settings[name]
}

function setValue(name, val) {
    settings[name] = val;
}

module.exports = {
    loadSettings,
    saveSettings,
    getValue,
    setValue,
}