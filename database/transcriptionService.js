const axios = require('axios');
const { 
    uploadAudioToAssemblyAI, 
    pollTranscription 
} = require('./data.js');
const { 
    ASSEMBLYAI_API_KEY, 
    ASSEMBLYAI_BASE_URL 
} = require('./apis.js');

/**
 * Transcribes audio from buffer or URL
 */
async function transcribeAudio(buffer, isFile = false) {
    try {
        console.log('🎤 Starting transcription...');
        
        let audioUrl;
        if (isFile && buffer) {
            audioUrl = await uploadAudioToAssemblyAI(buffer);
            if (!audioUrl) return null;
        } else {
            audioUrl = buffer;
        }

        const headers = {
            'authorization': ASSEMBLYAI_API_KEY,
            'content-type': 'application/json'
        };

        const data = {
            audio_url: audioUrl,
            speech_model: 'best',
            language_detection: true
        };

        const response = await axios.post(`${ASSEMBLYAI_BASE_URL}/transcript`, data, { headers });
        const transcriptId = response.data.id;

        return await pollTranscription(transcriptId);
    } catch (error) {
        console.error('❌ Transcription Error:', error.message);
        return null;
    }
}

module.exports = { transcribeAudio };