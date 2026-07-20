const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// KTP VIP Lu
const cookieString = `VISITOR_INFO1_LIVE=gpQNdIaelD0; VISITOR_PRIVACY_METADATA=CgJJRBIEGgAgQw%3D%3D; __Secure-BUCKET=CNID; LOGIN_INFO=AFmmF2swRQIhALh13eYeVXZVjr-BiTjsz0FDMmAwZNltjZFxgOHgI8ExAiAkG8bf5eP4EVyhDZ0MC_vbX8OSw-nS9dryZfDXRKTNzg:QUQ3MjNmeEFpcm5JQkZxeGpobzdoaGFDUTZEcklCUlJ4WWZWS1VjenRtLTNINjlFT1pid1NoeU0xbnM3UkxSTWNlQkFZT1I0WktFWHJSbWNZQ1Fuc2pBNE5pb3gwSDB0Mjh3aC15ZEdnRFZOaWdKTUVObnB4MUR6aFpteVRSbThXSl9RRXZHTVFpQW5VTjhzNlFJMUMyeXA2UVlhc2o4MmhR; PREF=f4=4000000&f6=40000000&tz=Asia.Jakarta&f7=100&repeat=NONE&autoplay=true; SID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJXcIwPx2YfiVlFlSohE9iZgwACgYKAQsSARISFQHGX2Mi2WJ-tmUl8DJ-BiqBEv6obBoVAUF8yKo0C3hH2C6uZei1sAOKh-2E0076; __Secure-1PSID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJXiBa53yl-M-nBTDBmM8-5KAACgYKARsSARISFQHGX2MiuGuNUFhCj1mMpE4-6_6oZxoVAUF8yKquCLFWp4M3SKXPXHlZrFAy0076; __Secure-3PSID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJX5-8ecac07GCx_3CGphW7wwACgYKAR8SARISFQHGX2Mi0NDUGV80JZVmCMbaZekdFRoVAUF8yKpXM6SWC51zQaxTn6XBJbSf0076; HSID=AhOthtHEp7At6QWjh; SSID=AOLMp3hazBip_oNpt; APISID=vj_Fl7lJ92Wi4WwB/AZdmIq2_UeJB9IgB2; SAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; __Secure-1PAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; __Secure-3PAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; YSC=vgtBBhth36o; SIDCC=AKEyXzUsjvp1xvsc2w2b70CYevjpA1sR4NwvzxXxBqsqLI2fJ4cuMclt8TlTbggxnAMs8iLPoKU; __Secure-1PSIDCC=AKEyXzV3GRIzspUP2_DhsZbpuAzVMAG2jUFzq7fLc86_AgS2tbra1vDWrGe1LPvsPBRJzqLvHA; __Secure-3PSIDCC=AKEyXzVsc_2U-JPJHvgTfV3cATE2L_8Qpp9xSgMd3KGFIx_t4X8L01FZkgiYu3zAqItnj7t5bKI`;

// INI JAWABAN ASLINYA: Kita convert string panjang jadi JSON biar ytdl-core nerima
const parsedCookies = cookieString.split(';').map(cookie => {
    const parts = cookie.split('=');
    return {
        name: parts[0].trim(),
        value: parts.slice(1).join('=').trim(),
        domain: '.youtube.com',
        path: '/'
    };
}).filter(c => c.name !== '');

// Bikin agen khusus anti-bot
const agent = ytdl.createAgent(parsedCookies);

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] STREAMING lagu ID: ${videoId} pakai ytdl-core + AGENT VIP...`);

    try {
        res.setHeader('Content-Type', 'audio/webm');

        const stream = ytdl(url, {
            agent: agent, // Pake agen yang udah di-convert tadi
            filter: 'audioonly'
        });

        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('PROSES GAGAL (YTDL-CORE ERROR):', err.message);
            if (!res.headersSent) res.status(500).send('Gagal streaming lagu');
        });

        req.on('close', () => {
            stream.destroy();
        });

    } catch (error) {
        console.error('PROSES GAGAL (SISTEM):', error.message);
        if (!res.headersSent) res.status(500).send('Terjadi kesalahan internal');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});