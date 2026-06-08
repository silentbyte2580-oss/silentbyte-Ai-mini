// index.js — SilentByte AI Mini (Web Pairing Edition)
// ─────────────────────────────────────────────────────
require('dotenv').config();
const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

require('events').EventEmitter.defaultMaxListeners = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ── Pairing API ───────────────────────────────────────
const pairRouter = require('./pair');
app.use('/code', pairRouter);

// ── Web UI ────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'main.html'));
});

// ── Start ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════╗
║       🤖  SILENTBYTE AI MINI  🤖             ║
║       Web Pairing Edition v2.0.2             ║
║       by Iconic Tech / SilentByte Inc        ║
╠══════════════════════════════════════════════╣
║  UI  ➜  http://0.0.0.0:${PORT}                ║
║  API ➜  http://0.0.0.0:${PORT}/code           ║
╚══════════════════════════════════════════════╝
`);
});

module.exports = app;
