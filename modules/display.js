// modules/display.js
// ─────────────────────────────────────────────
// All terminal/console visual output for the bot

const BOT_NAME = "Silentbyte AI";

function showOnline() {
    console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║   🚀  ${BOT_NAME} IS ONLINE        ║
║                                       ║
╚═══════════════════════════════════════╝
`);
}

function showLoggedOut() {
    console.log('🚪 Logged out. Not reconnecting.');
}

function showReconnecting(statusCode) {
    console.log(`🔄 Reconnecting in 5s... (reason: ${statusCode})`);
}

function showPairingCode(formattedCode) {
    console.log('');
    console.log('╔═══════════════════════════════════════╗');
    console.log(`║     🔑 CODE: ${formattedCode.padEnd(25)}║`);
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
}

function showRegistrationPrompt() {
    console.log('\n📱 PHONE NUMBER REGISTRATION REQUIRED\n');
}

function showGeneratingCode() {
    console.log('\n🔄 Generating verification code...\n');
}

function showRegistrationFailed(message) {
    console.log(`❌ Registration failed: ${message}`);
}

function showServerRunning(port) {
    console.log(`🌐 Health check server running on port ${port}`);
}

function showHandlerError(message) {
    console.error(`❌ handleMessages crashed: ${message}`);
}

module.exports = {
    BOT_NAME,
    showOnline,
    showLoggedOut,
    showReconnecting,
    showPairingCode,
    showRegistrationPrompt,
    showGeneratingCode,
    showRegistrationFailed,
    showServerRunning,
    showHandlerError,
};
