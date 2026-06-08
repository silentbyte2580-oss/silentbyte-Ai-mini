const axios = require('axios');

/**
 * Uploads audio buffer to AssemblyAI
 */
async function uploadAudioToAssemblyAI(buffer, filename = "audio.mp3") {
    try {
        console.log('📤 Uploading audio to AssemblyAI...');
        const response = await axios.post(
            `${process.env.ASSEMBLYAI_BASE_URL || "https://api.assemblyai.com/v2"}/upload`,
            buffer,
            {
                headers: {
                    'authorization': process.env.ASSEMBLYAI_API_KEY || "7388400b7c8c47d6a62d62eb0c8a2443",
                    'content-type': 'application/octet-stream'
                }
            }
        );
        return response.data.upload_url;
    } catch (error) {
        console.error('❌ Audio Upload Error:', error.message);
        return null;
    }
}

/**
 * Poll for transcription completion
 */
async function pollTranscription(transcriptId) {
    try {
        const headers = {
            'authorization': process.env.ASSEMBLYAI_API_KEY || "7388400b7c8c47d6a62d62eb0c8a2443"
        };

        while (true) {
            const response = await axios.get(
                `${process.env.ASSEMBLYAI_BASE_URL || "https://api.assemblyai.com/v2"}/transcript/${transcriptId}`,
                { headers }
            );
            const { status, text, error } = response.data;

            if (status === 'completed') {
                console.log('✅ Transcription completed');
                return text;
            } else if (status === 'error') {
                throw new Error(`Transcription failed: ${error}`);
            } else {
                console.log(`⏳ Transcription status: ${status}`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    } catch (error) {
        console.error('❌ Polling Error:', error.message);
        return null;
    }
}

module.exports = {
    uploadAudioToAssemblyAI,
    pollTranscription
};