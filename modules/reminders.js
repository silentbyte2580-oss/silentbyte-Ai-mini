// modules/reminders.js
// ─────────────────────────────────────────────
// 4-hour follow-up reminder system

let reminders = {};

function setReminder(jid, lastUserMessage, lastBotMessage) {
    // Clear any existing reminder for this chat
    if (reminders[jid]) {
        clearTimeout(reminders[jid]);
    }

    // Set new 4-hour reminder
    reminders[jid] = setTimeout(async () => {
        try {
            const { getMemory } = require('./memory.js');
            const memoryData = getMemory(jid);

            if (global.silentbyteinc && memoryData && memoryData.length > 0) {
                const lastConversation = memoryData[memoryData.length - 1];

                const reminderMessage =
                    `👋 *Reminder!*\n\nWe were talking about:\n"${lastUserMessage || lastConversation.user}"\n\nDid you want to continue our conversation?`;

                await global.silentbyteinc.sendMessage(jid, { text: reminderMessage });
                console.log(`⏰ Sent 4-hour reminder to ${jid}`);

                delete reminders[jid];
            }
        } catch (error) {
            console.error('❌ Error sending reminder:', error.message);
        }
    }, 4 * 60 * 60 * 1000);
}

module.exports = { setReminder };
