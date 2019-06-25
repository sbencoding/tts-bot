const fs = require('fs');
let settings;

/**
 * Load the settings file
 * @param {String} settingsPath The path of the settings file
 */
function loadSettings(settingsPath) {
    const fileContent = fs.readFileSync(settingsPath);
    settings = JSON.parse(fileContent);
}

/**
 * Save the settings to a file
 * @param {String} settingsPath The path of the settings file
 */
function saveSettings(settingsPath) {
    const fileContent = JSON.stringify(settings);
    fs.writeFileSync(settingsPath, fileContent);   
}

/**
 * Get an option's value from the settings
 * @param {String} name The name of the option to get
 */
function getValue(name) {
    return settings[name]
}

/**
 * Set an option's value in the settings
 * @param {String} name The name of the option
 * @param {String} val The value to set
 */
function setValue(name, val) {
    settings[name] = val;
}

module.exports = {
    loadSettings,
    saveSettings,
    getValue,
    setValue,
}