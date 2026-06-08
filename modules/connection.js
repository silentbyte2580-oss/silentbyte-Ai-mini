// modules/connection.js
// ─────────────────────────────────────────────
// Handles connection lifecycle: open, close, reconnect events

const { autoFollowNewsletter, autoJoinGroup } = require('./bio.js');

/**
 * Registers connection.update listener.
 * Triggers newsletter follow + group join when socket opens.
 */
function registerConnectionHandler(silentbyteinc) {
    silentbyteinc.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            await autoFollowNewsletter(silentbyteinc);
            await autoJoinGroup(silentbyteinc);
        }
    });
}

module.exports = { registerConnectionHandler };
