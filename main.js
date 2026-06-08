// main.js — SilentByte AI Mini
// ─────────────────────────────────────────────
const { chatbot }                   = require('./setting.js');
const { startBioRotation }          = require('./modules/bio.js');
const { registerCallHandler }       = require('./modules/handlers.js');
const { initMemory }                = require('./modules/memoryScheduler.js');
const { registerConnectionHandler } = require('./modules/connection.js');
const { registerMessageRouter }     = require('./modules/messageRouter.js');

global.chatbot = chatbot;

/**
 * Main logic handler — called from pair.js once socket connects
 */
async function handleMessages(silentbyteinc) {
    global.silentbyteinc = silentbyteinc;

    await initMemory();
    startBioRotation(silentbyteinc);
    registerConnectionHandler(silentbyteinc);
    registerCallHandler(silentbyteinc);
    registerMessageRouter(silentbyteinc);
}

module.exports = { handleMessages };
