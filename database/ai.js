const axios = require('axios');
const { 
    fetchAIResponseFromAPI 
} = require('./data.js');
const { 
    buildMasterPrompt 
} = require('./promptBuilder.js');
const { 
    transcribeAudio 
} = require('./transcriptionService.js');
const { 
    uploadImage,
    generateImages,
    analyzeImage 
} = require('./imageService.js');
const { 
    VENICE_CHAT_URL
} = require('./apis.js');

/**
 * Calls Venice Chat API directly
 */
async function fetchVeniceResponse(query) {
    try {
        const res = await axios.get(VENICE_CHAT_URL, {
            params: { message: query },
            timeout: 15000
        });
        const data = res.data;
        if (data?.status && data?.result) {
            return data.result;
        }
        return null;
    } catch (err) {
        console.error('❌ Venice API error:', err.message);
        return null;
    }
}

/**
 * Cycles through backup APIs for text generation
 */
async function fetchAIResponse(query, chatHistory = []) {
    try {
        console.log('🤖 Processing AI response...');
        console.log('📝 Query:', query);
        console.log('💾 Memory length:', chatHistory.length);

        if (chatHistory.length > 0) {
            console.log('🔍 Memory sample:', JSON.stringify(chatHistory.slice(-3), null, 2));
        }

        // ── Format conversation history ──────────────────────────────────────
        let formattedHistory = '';

        if (chatHistory && chatHistory.length > 0) {
            const recentHistory = chatHistory.slice(-15);

            recentHistory.forEach((item) => {
                if (item.user && item.bot) {
                    formattedHistory += `User: ${item.user}\nAI: ${item.bot}\n`;
                } else if (item.role && item.text) {
                    const role = item.role === 'user' ? 'User' : 'AI';
                    formattedHistory += `${role}: ${item.text}\n`;
                } else if (typeof item === 'string') {
                    formattedHistory += `${item}\n`;
                }
            });
        }

        // ── Build full prompt with all modules ───────────────────────────────
        const masterPrompt = buildMasterPrompt();

        const fullPrompt = `${masterPrompt}

Previous conversation:
${formattedHistory}
Current query:
User: ${query}

AI:`;

        console.log('📤 Full prompt length:', fullPrompt.length);

        // ── Try Venice Chat ──────────────────────────────────────────────────
        console.log('🔄 Trying Venice Chat API...');
        const veniceResult = await fetchVeniceResponse(fullPrompt);
        if (veniceResult) {
            console.log('✅ Venice Chat responded');
            return veniceResult;
        }

        console.log('❌ All APIs failed');
        return "I apologize, but I'm having trouble responding right now. Please try again.";

    } catch (error) {
        console.error('❌ fetchAIResponse Error:', error.message);
        return "I encountered an error while processing your request.";
    }
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    uploadImage,
    fetchAIResponse,
    generateImages,
    analyzeImage,
    transcribeAudio
};