// pair.js — SilentByte AI Mini Web Pairing
// ─────────────────────────────────────────────────────
require('dotenv').config();
const express = require('express');
const fs      = require('fs-extra');
const path    = require('path');
const router  = express.Router();
const pino    = require('pino');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestQueenruvaSocketsVersion,
    Browsers,
    DisconnectReason,
    delay,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
} = require('queenruva-sockets');
const { Boom } = require('@hapi/boom');

const setting        = require('./setting');
const { handleMessages } = require('./main');

// ── State ─────────────────────────────────────────────
const activeSockets = new Map();
const SESSION_BASE  = setting.sessionPath || './session';
fs.ensureDirSync(SESSION_BASE);

// ── Core Pair Function ────────────────────────────────
async function SilentBytePair(number, res) {
    const sanitized   = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(SESSION_BASE, `session_${sanitized}`);
    fs.ensureDirSync(sessionPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version }          = await fetchLatestQueenruvaSocketsVersion();
    const logger               = pino({ level: 'silent' });

    try {
        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys:  makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal:   false,
            logger,
            browser:             Browsers.ubuntu('Chrome'),
            markOnlineOnConnect: true,
        });

        // ── Request pairing code ──────────────────────
        if (!sock.authState.creds.registered) {
            let retries = setting.maxRetries || 3;
            let code;
            while (retries > 0) {
                try {
                    await delay(1500);
                    code = await sock.requestPairingCode(sanitized);
                    break;
                } catch (err) {
                    retries--;
                    console.warn(`⚠️ Pairing code attempt failed, retries left: ${retries}`);
                    await delay(2000);
                }
            }
            const formatted = code?.match(/.{1,4}/g)?.join('-') || code || 'ERROR';
            if (res && !res.headersSent) res.send({ code: formatted });
        } else {
            if (res && !res.headersSent) {
                res.send({ code: null, status: 'already_registered' });
            }
        }

        // ── Creds ─────────────────────────────────────
        sock.ev.on('creds.update', saveCreds);

        // ── Connection lifecycle ──────────────────────
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                activeSockets.set(sanitized, sock);
                console.log(`✅ SilentByte AI connected: ${sanitized}`);

                try {
                    // Start all AI features
                    await handleMessages(sock);

                    // Welcome DM
                    const userJid = jidNormalizedUser(sock.user.id);
                    await sock.sendMessage(userJid, {
                        text: `🤖 *SILENTBYTE AI MINI CONNECTED*\n\n✅ Successfully paired!\n📱 Number: ${sanitized}\n\n⚡ *Active Features:*\n• 🧠 AI Chat (text, image, voice, stickers)\n• 🎨 Image Generation  \`gen <prompt>\`\n• 🖼️ Image Vision Analysis\n• 🎤 Voice Transcription\n• 💾 Conversation Memory\n• ⏰ 4-Hour Reminders\n• 📝 Auto Bio Update\n• 📵 Auto Call Reject + AI Reply\n\n> *SilentByte AI Mini v2.0.2 by Iconic Tech*`
                    });
                } catch (err) {
                    console.error('Post-connect error:', err.message);
                }
            }

            if (connection === 'close') {
                activeSockets.delete(sanitized);
                const code = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output?.statusCode
                    : null;
                const shouldReconnect = code !== DisconnectReason.loggedOut;

                if (shouldReconnect) {
                    console.log(`🔁 Reconnecting ${sanitized} in 5s...`);
                    await delay(5000);
                    const mockRes = { headersSent: true, send: () => {}, status: () => mockRes };
                    SilentBytePair(sanitized, mockRes);
                } else {
                    console.log(`🔒 ${sanitized} logged out — cleaning session`);
                    try { fs.removeSync(sessionPath); } catch {}
                }
            }
        });

    } catch (err) {
        console.error('❌ Pairing error:', err.message);
        if (res && !res.headersSent) {
            try { res.status(503).send({ error: 'Service Unavailable. Please try again.' }); } catch {}
        }
    }
}

// ── Auto-reconnect saved sessions on boot ─────────────
async function autoReconnect() {
    if (!fs.existsSync(SESSION_BASE)) return;
    const entries = fs.readdirSync(SESSION_BASE);
    for (const entry of entries) {
        const credsFile = path.join(SESSION_BASE, entry, 'creds.json');
        if (fs.existsSync(credsFile)) {
            const number = entry.replace('session_', '');
            if (!activeSockets.has(number)) {
                console.log(`🔁 Auto-reconnecting: ${number}`);
                const mockRes = { headersSent: true, send: () => {}, status: () => mockRes };
                await SilentBytePair(number, mockRes);
                await delay(2000);
            }
        }
    }
}
autoReconnect();

// ── Routes ────────────────────────────────────────────

// GET /code?number=263... — get a pairing code
router.get('/', async (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).send({ error: 'Number parameter is required' });

    const sanitized = number.replace(/[^0-9]/g, '');
    if (activeSockets.has(sanitized)) {
        return res.send({ status: 'already_connected', message: 'This number is already connected and running!' });
    }

    await SilentBytePair(sanitized, res);
});

// GET /code/active — list all active sessions
router.get('/active', (req, res) => {
    res.send({
        count:   activeSockets.size,
        numbers: Array.from(activeSockets.keys()),
    });
});

// GET /code/ping — health check
router.get('/ping', (req, res) => {
    res.send({
        status:  'online',
        bot:     'SilentByte AI Mini',
        version: '2.0.2',
        sessions: activeSockets.size,
    });
});

// GET /code/disconnect?number=... — disconnect a session
router.get('/disconnect', async (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).send({ error: 'Number is required' });

    const sanitized = number.replace(/[^0-9]/g, '');
    const sock      = activeSockets.get(sanitized);
    if (!sock) return res.status(404).send({ error: 'No active session for this number' });

    try {
        await sock.logout();
        activeSockets.delete(sanitized);
        res.send({ status: 'disconnected', number: sanitized });
    } catch {
        res.status(500).send({ error: 'Failed to disconnect' });
    }
});

module.exports = router;
