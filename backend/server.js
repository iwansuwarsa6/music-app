const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] MINTA BANTUAN COBALT API UNTUK ID: ${videoId}`);

    try {
        // Tembak server Cobalt.tools pakai POST request
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: `https://www.youtube.com/watch?v=${videoId}`,
                isAudioOnly: true // Kita tegaskan cuma mau audionya aja
            })
        });

        const data = await response.json();

        // Kalau Cobalt ngeluh error, kita tangkep pesannya
        if (data.status === 'error') {
            console.error('❌ Cobalt Error:', data.text);
            return res.status(500).send('Cobalt gagal nembus blokiran');
        }

        // Kalau sukses, Cobalt bakal ngasih URL stream langsung
        if (data.url) {
            console.log('✅ DAPET LINK DARI COBALT! Redirect Vercel sekarang...');
            res.redirect(data.url);
        } else {
            console.error('❌ URL tidak ditemukan di response Cobalt');
            res.status(500).send('URL audio tidak ditemukan');
        }

    } catch (error) {
        console.error('❌ Server Cobalt gagal diakses:', error.message);
        res.status(500).send('Server Bypass Down');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER COBALT JALAN DI PORT ${PORT} 🔥`);
});