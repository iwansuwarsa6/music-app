const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const ytDlpPath = './yt-dlp';

// INI DIA TIKET VIP KITA KEMAREN!
const YOUTUBE_COOKIE = `VISITOR_INFO1_LIVE=gpQNdIaelD0; VISITOR_PRIVACY_METADATA=CgJJRBIEGgAgQw%3D%3D; __Secure-BUCKET=CNID; LOGIN_INFO=AFmmF2swRQIhALh13eYeVXZVjr-BiTjsz0FDMmAwZNltjZFxgOHgI8ExAiAkG8bf5eP4EVyhDZ0MC_vbX8OSw-nS9dryZfDXRKTNzg:QUQ3MjNmeEFpcm5JQkZxeGpobzdoaGFDUTZEcklCUlJ4WWZWS1VjenRtLTNINjlFT1pid1NoeU0xbnM3UkxSTWNlQkFZT1I0WktFWHJSbWNZQ1Fuc2pBNE5pb3gwSDB0Mjh3aC15ZEdnRFZOaWdKTUVObnB4MUR6aFpteVRSbThXSl9RRXZHTVFpQW5VTjhzNlFJMUMyeXA2UVlhc2o4MmhR; PREF=f4=4000000&f6=40000000&tz=Asia.Jakarta&f7=100&repeat=NONE&autoplay=true; SID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJXcIwPx2YfiVlFlSohE9iZgwACgYKAQsSARISFQHGX2Mi2WJ-tmUl8DJ-BiqBEv6obBoVAUF8yKo0C3hH2C6uZei1sAOKh-2E0076; __Secure-1PSID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJXiBa53yl-M-nBTDBmM8-5KAACgYKARsSARISFQHGX2MiuGuNUFhCj1mMpE4-6_6oZxoVAUF8yKquCLFWp4M3SKXPXHlZrFAy0076; __Secure-3PSID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJX5-8ecac07GCx_3CGphW7wwACgYKAR8SARISFQHGX2Mi0NDUGV80JZVmCMbaZekdFRoVAUF8yKpXM6SWC51zQaxTn6XBJbSf0076; HSID=AhOthtHEp7At6QWjh; SSID=AOLMp3hazBip_oNpt; APISID=vj_Fl7lJ92Wi4WwB/AZdmIq2_UeJB9IgB2; SAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; __Secure-1PAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; __Secure-3PAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; YSC=vgtBBhth36o; SIDCC=AKEyXzUsjvp1xvsc2w2b70CYevjpA1sR4NwvzxXxBqsqLI2fJ4cuMclt8TlTbggxnAMs8iLPoKU; __Secure-1PSIDCC=AKEyXzV3GRIzspUP2_DhsZbpuAzVMAG2jUFzq7fLc86_AgS2tbra1vDWrGe1LPvsPBRJzqLvHA; __Secure-3PSIDCC=AKEyXzVsc_2U-JPJHvgTfV3cATE2L_8Qpp9xSgMd3KGFIx_t4X8L01FZkgiYu3zAqItnj7t5bKI`;

// 1. Fungsi Ajaib: Download yt-dlp
async function siapkanYtDlp() {
    if (fs.existsSync(ytDlpPath)) return;
    console.log('⏳ Mendownload yt-dlp murni dari GitHub...');

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(ytDlpPath);
        https.get('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp', (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        fs.chmodSync(ytDlpPath, 0o755);
                        console.log('✅ yt-dlp siap digunakan!');
                        resolve();
                    });
                }).on('error', reject);
            } else {
                reject(new Error('Gagal download yt-dlp, status: ' + res.statusCode));
            }
        }).on('error', reject);
    });
}

// 2. Endpoint Streaming
app.get('/api/audio', (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] STREAMING lagu ID: ${videoId}`);
    res.setHeader('Content-Type', 'audio/webm');

    // Suntik KTP VIP pakai --add-header
    const stream = spawn(ytDlpPath, [
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio',
        '--add-header', `Cookie: ${YOUTUBE_COOKIE}`,
        '--add-header', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '-o', '-'
    ]);

    stream.stdout.pipe(res);

    stream.stderr.on('data', (data) => {
        console.error(`[YT-DLP LOG]: ${data.toString().trim()}`);
    });

    stream.on('error', (err) => {
        console.error('❌ PROSES GAGAL SPAWN:', err.message);
        if (!res.headersSent) res.status(500).send('Gagal memutar lagu');
    });
    
    // Pastikan kalau yt-dlp ngambek dan nutup, res-nya ikut ditutup biar browser ga bingung
    stream.on('close', (code) => {
        if (code !== 0) {
            console.error(`[⚠️] yt-dlp mati mendadak dengan kode: ${code}`);
        }
    });

    req.on('close', () => stream.kill());
});

// 3. Nyalakan server
siapkanYtDlp().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
    });
}).catch(err => {
    console.error('Gagal menyiapkan sistem:', err);
});