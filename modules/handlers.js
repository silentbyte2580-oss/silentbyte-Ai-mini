// modules/handlers.js
// ─────────────────────────────────────────────
// All message, media, and call event handlers

const { downloadContentFromMessage } = require('queenruva-sockets');
const { uploadImage, fetchAIResponse, generateImages, analyzeImage, transcribeAudio } = require('../database/ai.js');
const { addToMemory, getMemory } = require('./memory.js');
const { log, BOT_NAME } = require('./logger.js');

/**
 * Register the call rejection handler
 */
function registerCallHandler(silentbyteinc) {
    silentbyteinc.ev.on('call', async (call) => {
        try {
            await silentbyteinc.rejectCall(call.id, call.from);

            const jid = call.from;
            const memoryHistory = getMemory(jid);
            const aiReply = await fetchAIResponse("User attempted a call", memoryHistory);

            if (aiReply) {
                addToMemory(jid, "[Call Attempt]", aiReply);
                await silentbyteinc.sendMessage(jid, { text: aiReply });
                log(BOT_NAME, aiReply, true);
            }
        } catch (error) {
            console.error("Call handling error:", error.message);
        }
    });
}

/**
 * Handle incoming sticker messages
 */
async function handleSticker(silentbyteinc, m, jid, text, quotedContext) {
    await silentbyteinc.sendMessage(jid, { react: { text: '🎭', key: m.key } });

    let query = text ? text : "User sent a sticker";
    if (quotedContext) query = `Replying to: "${quotedContext}". ${text || "User sent a sticker"}`;

    const memoryHistory = getMemory(jid);
    const aiReply = await fetchAIResponse(query, memoryHistory);

    if (aiReply) {
        addToMemory(jid, query, aiReply);
        await silentbyteinc.sendMessage(jid, { text: aiReply }, { quoted: m });
        log(BOT_NAME, aiReply, true);
    }
}

/**
 * Handle incoming audio / PTT messages
 */
async function handleAudio(silentbyteinc, m, jid, messageType) {
    await silentbyteinc.sendMessage(jid, { react: { text: '🎤', key: m.key } });

    const stream = await downloadContentFromMessage(m.message[messageType], 'audio');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const transcription = await transcribeAudio(buffer, true);
    if (transcription) {
        await silentbyteinc.sendMessage(jid, { text: `🎤 *Transcription:*\n\n${transcription}` }, { quoted: m });

        const memoryHistory = getMemory(jid);
        const aiReply = await fetchAIResponse(transcription, memoryHistory);

        if (aiReply) {
            addToMemory(jid, transcription, aiReply);
            await silentbyteinc.sendMessage(jid, { text: aiReply });
            log(BOT_NAME, aiReply, true);
        }
    }
}

/**
 * Handle incoming image messages (vision analysis)
 */
async function handleImage(silentbyteinc, m, jid, text) {
    await silentbyteinc.sendMessage(jid, { react: { text: '🖼️', key: m.key } });

    const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const uploadedUrl = await uploadImage(buffer);
    const analysis = uploadedUrl
        ? await analyzeImage(uploadedUrl, text || "Explain this image in detail.")
        : null;

    if (analysis) {
        await silentbyteinc.sendMessage(jid, { text: analysis }, { quoted: m });
        addToMemory(jid, `[Image] ${text || ''}`, analysis);
    } else {
        const memoryHistory = getMemory(jid);
        const errReply = await fetchAIResponse(
            `You tried to analyze an image but the vision API failed${!uploadedUrl ? ' and the image upload also failed' : ''}. Tell the user you couldn't process their image right now.`,
            memoryHistory
        );
        if (errReply) await silentbyteinc.sendMessage(jid, { text: errReply }, { quoted: m });
    }
}

/**
 * Handle image generation via "gen <prompt>" command
 */
async function handleImageGeneration(silentbyteinc, m, jid, text) {
    const prompt = text.slice(4).trim();
    await silentbyteinc.sendMessage(jid, { react: { text: '🎨', key: m.key } });

    const images = await generateImages(prompt);

    if (images && images.length > 0) {
        for (const buf of images) {
            await silentbyteinc.sendMessage(jid, {
                image: buf,
                caption: `*Generated:* ${prompt}`
            });
        }
        addToMemory(jid, `[Image Generation] ${prompt}`, `Generated ${images.length} image(s)`);
    } else {
        const memoryHistory = getMemory(jid);
        const errReply = await fetchAIResponse(
            `You tried to generate an image for "${prompt}" but the API failed. Tell the user you couldn't generate the image right now.`,
            memoryHistory
        );
        if (errReply) await silentbyteinc.sendMessage(jid, { text: errReply }, { quoted: m });
    }
}

/**
 * Handle plain text messages
 */
async function handleText(silentbyteinc, m, jid, text, quotedContext) {
    await silentbyteinc.sendMessage(jid, { react: { text: '⌨️', key: m.key } });

    const aiQuery = quotedContext ? `Replying to: "${quotedContext}". ${text}` : text;
    const memoryHistory = getMemory(jid);
    const aiReply = await fetchAIResponse(aiQuery, memoryHistory);

    if (aiReply) {
        addToMemory(jid, text, aiReply);
        await silentbyteinc.sendMessage(jid, { text: aiReply }, { quoted: m });
        log(BOT_NAME, aiReply, true);
    }
}

module.exports = {
    registerCallHandler,
    handleSticker,
    handleAudio,
    handleImage,
    handleImageGeneration,
    handleText
};
