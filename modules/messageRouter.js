// modules/messageRouter.js
// ─────────────────────────────────────────────
// Parses incoming messages and routes them to the correct handler

const { log } = require('./logger.js');
const {
    handleSticker,
    handleAudio,
    handleImage,
    handleImageGeneration,
    handleText
} = require('./handlers.js');

function extractText(message) {
    return (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.stickerMessage?.caption ||
        ''
    );
}

function extractQuotedContext(message) {
    const quotedMsg = message.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) return '';
    return (
        quotedMsg.conversation ||
        quotedMsg.extendedTextMessage?.text ||
        quotedMsg.imageMessage?.caption ||
        quotedMsg.stickerMessage?.caption ||
        '[Media]'
    );
}

function registerMessageRouter(silentbyteinc) {
    silentbyteinc.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.message || m.key.fromMe) return;

            const jid = m.key.remoteJid;
            if (jid.endsWith('@g.us') || !global.chatbot) return;

            const userName    = m.pushName || jid.split('@')[0];
            const messageType = Object.keys(m.message)[0];

            await silentbyteinc.readMessages([m.key]);

            const text          = extractText(m.message);
            const quotedContext = extractQuotedContext(m.message);

            log(
                userName,
                quotedContext
                    ? `(Replying to: ${quotedContext}) ${text || '[Media]'}`
                    : text || '[Media]'
            );

            await silentbyteinc.sendPresenceUpdate('composing', jid);

            if (messageType === 'stickerMessage') {
                await handleSticker(silentbyteinc, m, jid, text, quotedContext);
                return;
            }

            if (messageType === 'audioMessage' || messageType === 'ptt') {
                await handleAudio(silentbyteinc, m, jid, messageType);
                return;
            }

            if (messageType === 'imageMessage') {
                await handleImage(silentbyteinc, m, jid, text);
                return;
            }

            if (text.toLowerCase().startsWith('gen ')) {
                await handleImageGeneration(silentbyteinc, m, jid, text);
                return;
            }

            if (text) {
                await handleText(silentbyteinc, m, jid, text, quotedContext);
            }

        } catch (error) {
            console.error('Critical Error:', error.message);
        }
    });
}

module.exports = { registerMessageRouter };
