const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 KITA BUANG API KEY! INI DAFTAR SERVER "PEMBAJAK" GRATIS (PIPED INSTANCES) 🔥
// Nggak ada limit, nggak butuh daftar akun!
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.smnz.de'
];

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] MENCURI AUDIO ID: ${videoId} TANPA API KEY...`);

    let audioUrl = null;

    // Mesin keliling ke 4 server scraper beda negara
    for (let i = 0; i < PIPED_INSTANCES.length; i++) {
        const instance = PIPED_INSTANCES[i];
        console.log(`Mengetuk Pintu Scraper ke-${i + 1} (${instance})...`);

        try {
            // Pasang timer 5 detik. Kalau servernya lemot/mati, langsung skip ke server berikutnya
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${instance}/streams/${videoId}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.log(`❌ Scraper ${i + 1} menolak. Lanjut geser...`);
                continue;
            }

            const data = await response.json();
            
            // Cari stream audio (M4A/MP4) yang paling cocok buat HP
            if (data && data.audioStreams && data.audioStreams.length > 0) {
                const bestAudio = data.audioStreams.find(stream => stream.mimeType.includes('mp4') || stream.mimeType.includes('m4a')) || data.audioStreams[0];
                
                audioUrl = bestAudio.url;
                break; // Lagu dapet! Stop perputaran server
            }
        } catch (err) {
            console.log(`❌ Server ${instance} mati/lemot. Geser...`);
        }
    }

    // Eksekusi hasil buruan
    if (audioUrl) {
        console.log('✅ LINK AUDIO BAJAKAN DAPAT! Mengalihkan ke Frontend...');
        res.redirect(audioUrl);
    } else {
        console.log('⚠️ SEMUA SCRAPER BULE MATI. PAKAI JALUR DARURAT (SIPUTZX)...');
        
        // JALUR DARURAT (Fallback) kalau 4 server di atas lagi down barengan
        try {
            const siputRes = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=https://youtu.be/${videoId}`);
            const siputData = await siputRes.json();
            if (siputData && siputData.data && siputData.data.dl) {
                console.log('✅ DAPAT DARI JALUR DARURAT LOKAL!');
                return res.redirect(siputData.data.dl);
            }
        } catch(e) {
            console.log('❌ Jalur darurat juga mati.');
        }
        
        res.status(500).send('Gagal total! Semua mesin scraper lagi down. Tunggu bentar terus coba lagi.');
    }
});

// 🔥 ENDPOINT TAMBAHAN: Buat Fitur Download MP3 di Frontend lu 🔥
app.get('/api/download', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');
    
    console.log(`[⬇️] REQUEST DOWNLOAD MP3: ${videoId}`);
    try {
        // Tembak ke downloader khusus MP3
        const siputRes = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=https://youtu.be/${videoId}`);
        const siputData = await siputRes.json();
        if (siputData && siputData.data && siputData.data.dl) {
            return res.redirect(siputData.data.dl);
        }
    } catch(e) {}
    
    res.status(500).send('Gagal mengambil file download. Server sumber error.');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER SCRAPER API UNLIMITED JALAN DI PORT ${PORT} 🔥`);
});