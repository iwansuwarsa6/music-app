const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] MENYEDOT VIA RAPID-API (YT MP3) ID: ${videoId}`);

    // Data sesuai dengan yang ada di screenshot lu
    const rapidApiHost = 'youtube-mp36.p.rapidapi.com';
    const rapidApiUrl = `https://${rapidApiHost}/dl?id=${videoId}`;

    try {
        const response = await fetch(rapidApiUrl, {
            method: 'GET',
            headers: {
                // Ini Host dari screenshot
                'x-rapidapi-host': rapidApiHost,
                // Ini API Key dari screenshot lu
                'x-rapidapi-key': '937d750ff1msh90d3afecabf1714p10cbe5jsna5bc5d8d048c' 
            }
        });

        if (!response.ok) {
            throw new Error(`API error, status: ${response.status}`);
        }

        const data = await response.json();
        
        // API ini biasanya nyimpen link MP3-nya di data.link
        const audioUrl = data.link;

        if (audioUrl) {
            console.log('✅ LINK AUDIO VIP DAPAT! Mengalihkan...');
            res.redirect(audioUrl);
        } else {
            console.error('Data tidak sesuai:', data);
            throw new Error('Link MP3 nggak ketemu di respon API');
        }
    } catch (error) {
        console.error('❌ RAPID-API Gagal:', error.message);
        res.status(500).send('Gagal mengambil lagu dari server VIP');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER RAPID-API JALAN DI PORT ${PORT} 🔥`);
});