const { 
    generateSingleImage,
    analyzeImageFromAPI,
    uploadImage
} = require('./data.js');

/**
 * Generates 2 images based on a prompt, returns array of Buffers
 */
async function generateImages(prompt) {
    try {
        console.log(`🎨 Generating images for: ${prompt}`);
        const imageBuffers = [];

        for (let i = 0; i < 2; i++) {
            const buffer = await generateSingleImage(prompt);
            if (buffer) {
                imageBuffers.push(buffer);
            }
            if (i < 1) await new Promise(r => setTimeout(r, 1000));
        }

        return imageBuffers;
    } catch (error) {
        console.error('❌ Image generation failed:', error.message);
        return [];
    }
}

/**
 * Handles Vision (Image Analysis)
 */
async function analyzeImage(imageUrl, query) {
    return await analyzeImageFromAPI(imageUrl, query);
}

module.exports = {
    uploadImage,
    generateImages,
    analyzeImage
};