// modules/memory.js
// ─────────────────────────────────────────────
// Handles persistent conversation memory (chatbot.json)

const fs = require('fs').promises;
const { setReminder } = require('./reminders.js');

const MEMORY_FILE = 'chatbot.json';
let memory = {};

async function loadMemory() {
    try {
        const data = await fs.readFile(MEMORY_FILE, 'utf8');
        memory = JSON.parse(data);
        console.log(`✅ Memory loaded from ${MEMORY_FILE}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`📁 Creating new memory file: ${MEMORY_FILE}`);
            memory = {};
            await saveMemory();
        } else {
            console.error('❌ Error loading memory:', error.message);
        }
    }
}

async function saveMemory() {
    try {
        const data = JSON.stringify(memory, null, 2);
        await fs.writeFile(MEMORY_FILE, data, 'utf8');
    } catch (error) {
        console.error('❌ Error saving memory:', error.message);
    }
}

function addToMemory(jid, user, bot) {
    if (!memory[jid]) {
        memory[jid] = [];
    }

    // Store all conversation history (unlimited)
    memory[jid].push({
        timestamp: Date.now(),
        user,
        bot
    });

    // Trigger 4-hour reminder
    setReminder(jid, user, bot);
}

function getMemory(jid) {
    return memory[jid] || [];
}

module.exports = { loadMemory, saveMemory, addToMemory, getMemory };
