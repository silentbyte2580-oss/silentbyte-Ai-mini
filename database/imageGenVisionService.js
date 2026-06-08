const axios = require('axios');

/**
 * Generates an image from a prompt
 */
async function generateSingleImage(prompt) {
    try {
        const url = `https://img.hazex.workers.dev/?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });

        if (response.status === 200 && response.data?.byteLength > 0) {
            return Buffer.from(response.data);
        }

        return null;
    } catch (error) {
        console.error('❌ Image generation error:', error.message);
        return null;
    }
}

/**
 * Analyzes image using Vision API
 */
async function analyzeImageFromAPI(imageUrl, query = "What's in this image?") {
    try {
        const res = await axios.get('https://apiskeith.top/ai/vision', {
            params: { image: imageUrl, q: query },
            timeout: 20000
        });

        if (res.data?.status && res.data?.result) {
            return res.data.result;
        }

        console.warn('⚠️ Vision API returned unexpected structure:', res.data);
        return null;
    } catch (e) {
        console.error('❌ Vision API Error:', e.message);
        return null;
    }
}

module.exports = {
    generateSingleImage,
    analyzeImageFromAPI
};