const axios = require('axios');

/**
 * Fetches AI response from available APIs
 */
async function fetchAIResponseFromAPI(url, query) {
    try {
        console.log(`🤖 Trying AI API: ${url}`);
        const res = await axios.get(url, { params: { q: query }, timeout: 15000 });
        if (res.data?.status && res.data?.result) {
            return res.data.result;
        }
        return null;
    } catch (e) {
        console.log(`⚠️ API Failed: ${url} — ${e.message}`);
        return null;
    }
}

module.exports = { fetchAIResponseFromAPI };