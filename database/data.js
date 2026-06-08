const {
    uploadAudioToAssemblyAI,
    pollTranscription
} = require('./audioService.js');

const { uploadImage } = require('./imageUploadService.js');

const { fetchAIResponseFromAPI } = require('./aiTextService.js');

const {
    generateSingleImage,
    analyzeImageFromAPI
} = require('./imageGenVisionService.js');

module.exports = {
    uploadAudioToAssemblyAI,
    pollTranscription,
    uploadImage,
    fetchAIResponseFromAPI,
    generateSingleImage,
    analyzeImageFromAPI
};