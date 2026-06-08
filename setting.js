// ꜱɪʟᴇɴᴛʙʏᴛᴇ ᴀɪ ᴄᴏɴꜰɪɢᴜʀᴀᴛɪᴏɴ
require('dotenv').config();

module.exports = {
    chatbot: process.env.CHATBOT !== 'true',  // Set to false to disable AI responses
    botName: process.env.BOT_NAME || 'SilentByte AI',
    ownerNumber: process.env.OWNER_NUMBER || '',
    sessionPath: process.env.SESSION_PATH || './session',
    port: parseInt(process.env.PORT || '3000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
};

/* ꜱɪʟᴇɴᴛʙʏᴛᴇ ᴀɪ ᴍᴏᴅᴇʟ ᴄʀᴇᴀᴛᴏʀ ʙʏ ɪᴄᴏɴɪᴄ ᴛᴇᴄʜ */
