const axios = require('axios');

/**
 * Uploads an image buffer — tries Catbox first, falls back to tmpfiles.org
 */
async function uploadImage(buffer) {
    try {
        const { default: FormData } = await import('form-data');

        // 1. Try Catbox
        try {
            const formData = new FormData();
            formData.append('reqtype', 'fileupload');
            formData.append('fileToUpload', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

            const response = await axios.post('https://catbox.moe/user/api.php', formData, {
                headers: formData.getHeaders(),
                timeout: 10000
            });

            const url = typeof response.data === 'string' ? response.data.trim() : null;
            if (url && url.startsWith('http')) {
                console.log('📸 Catbox upload OK:', url);
                return url;
            }
        } catch (e) {
            console.warn('⚠️ Catbox failed:', e.message);
        }

        // 2. Fallback: tmpfiles.org
        console.log('🔄 Trying tmpfiles.org...');
        const formData2 = new FormData();
        formData2.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

        const res2 = await axios.post('https://tmpfiles.org/api/v1/upload', formData2, {
            headers: formData2.getHeaders(),
            timeout: 10000
        });

        const rawUrl = res2.data?.data?.url;
        if (rawUrl) {
            // tmpfiles returns /file/xxx — need /dl/xxx for direct download
            const url2 = rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            console.log('📸 tmpfiles upload OK:', url2);
            return url2;
        }

        console.error('❌ Both upload hosts failed');
        return null;

    } catch (e) {
        console.error('❌ Upload Error:', e.message);
        return null;
    }
}

module.exports = { uploadImage };