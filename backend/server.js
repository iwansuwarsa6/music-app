const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] OPERASI CLUSTER PIPED YOUTUBE ID: ${videoId}`);

    // Kumpulan 5 Server Piped beda negara biar kebal down
    const pipedServers = [
        'https://pipedapi.moomoo.me',
        'https://pipedapi.syncpundit.io',
        'https://piped-api.garudalinux.org',
        'https://api.piped.projectsegfau.lt',
        'https://pipedapi.kavin.rocks'
    ];

    let audioUrl = null;

    for (const server of pipedServers) {
        try {
            console.log(`Mengetuk jalur tikus: ${server}...`);
            
            const response = await fetch(`${server}/streams/${videoId}`);

            if (!response.ok) {
                console.log(`❌ ${server} nolak (HTTP ${response.status}), ganti jalur...`);
                continue;
            }

            // RAHASIA ANTI-CRASH: Ambil text dulu, jangan langsung di-JSON-in
            const text = await response.text();
            
            // Pastikan balasannya beneran JSON (diawali kurung kurawal) biar gak error "Unexpected end of JSON"
            if (!text.startsWith('{')) {
                console.log(`❌ ${server} ngasih web error HTML, skip server ini!`);
                continue;
            }

            const data = JSON.parse(text);

            if (data.error) {
                console.log(`❌ ${server} diblokir YouTube: ${data.error}`);
                continue;
            }

            // Sortir dan ambil format audio dengan kualitas paling jernih (bitrate tertinggi)
            if (data.audioStreams && data.audioStreams.length > 0) {
                const bestAudio = data.audioStreams.sort((a, b) => b.bitrate - a.bitrate)[0];
                audioUrl = bestAudio.url;
                
                console.log(`✅ BERHASIL TEMBUS DI SERVER: ${server}`);
                break; 
            }
        } catch (err) {
            console.log(`❌ ${server} down/timeout, meluncur ke server cadangan...`);
        }
    }

    if (audioUrl) {
        console.log('✅ LINK AUDIO MURNI DIDAPATKAN! Mengalihkan...');
        res.redirect(audioUrl);
    } else {
        console.error('❌ SEMUA 5 CLUSTER PIPED TUMBANG');
        res.status(500).send('Gagal menembus API YouTube, semua jalur tikus mati');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER CLUSTER PIPED JALAN DI PORT ${PORT} 🔥`);
});