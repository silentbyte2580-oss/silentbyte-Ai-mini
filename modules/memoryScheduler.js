// modules/memoryScheduler.js
// ─────────────────────────────────────────────
// Initializes memory and starts the auto-save interval

const { loadMemory, saveMemory } = require('./memory.js');

/**
 * Loads memory from disk and starts auto-saving every 5 minutes.
 * Called once at startup from main.js
 */
async function initMemory() {
    await loadMemory();

    setInterval(async () => {
        await saveMemory();
    }, 5 * 60 * 1000);

    console.log('🕐 Memory auto-save scheduled every 5 minutes');
}

module.exports = { initMemory };
