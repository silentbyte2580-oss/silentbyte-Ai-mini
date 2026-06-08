// modules/logger.js
// ─────────────────────────────────────────────
// Stylish terminal logger

const BOT_NAME = "Silentbyte AI";

function log(sender, message, isBot = false) {
    const color = isBot ? '\x1b[35m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`${color}${sender}${reset} : ${message}`);
}

module.exports = { log, BOT_NAME };
