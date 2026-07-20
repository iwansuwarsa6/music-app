const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// RAHASIA VIP: Masukin semua API Key dari akun-akun tumbal lu ke sini
const apiKeys = [
    'MASUKIN_API_KEY_AKUN_1_DISINI',
    'MASUKIN_API_KEY_AKUN_2_DISINI',
    'MASUKIN_API_KEY_AKUN_3_DISINI'
];

let currentKeyIndex = 0; // Mulai dari akun pertama

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] OPERASI ROTASI VIP YOUTUBE ID: ${videoId}`);

    const rapidApiHost = 'MASUKIN_HOST_API_NYA_DISINI';
    const rapidApiUrl = `https://${rapidApiHost}/pintu-api-nya?id=${videoId}`;

    let audioUrl = null;
    let attempts = 0;

    // Sistem bakal nyoba terus sebanyak jumlah akun lu
    while (attempts < apiKeys.length) {
        const activeKey = apiKeys[currentKeyIndex];
        console.log(`Nyoba nembus pakai Akun API ke-${currentKeyIndex + 1}...`);

        try {
            const response = await fetch(rapidApiUrl, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': activeKey,
                    'X-RapidAPI-Host': rapidApiHost
                }
            });

            // Kalau dapet error 429 (Limit Habis), langsung ganti ke akun berikutnya
            if (response.status === 429) {
                console.log(`⚠️ Kuota Akun ke-${currentKeyIndex + 1} HABIS! Ganti akun...`);
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                attempts++;
                continue;
            }

            if (!response.ok) {
                console.log(`❌ Server nolak dengan status: ${response.status}`);
                break; // Kalau error lain, berhentiin pencarian
            }

            const data = await response.json();
            
            // Sesuaikan "data.link" dengan format dari API yang lu pilih
            if (data && data.link) {
                audioUrl = data.link;
                break; // Lagu dapet, keluar dari loop
            }

        } catch (err) {
            console.log(`❌ Gagal konek pakai akun ke-${currentKeyIndex + 1}, lanjut...`);
            attempts++;
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        }
    }

    if (audioUrl) {
        console.log('✅ LINK AUDIO ROTASI VIP DIDAPATKAN! Mengalihkan...');
        res.redirect(audioUrl);
    } else {
        res.status(500).send('Gagal menembus API, atau semua kuota akun lu udah abis total');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER ROTASI VIP JALAN DI PORT ${PORT} 🔥`);
});