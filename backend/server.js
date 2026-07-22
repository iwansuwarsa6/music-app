const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 INI DIA 5 NYAWA VIP LU SEKARANG 🔥
const apiKeys = [
    'f4e914fa55msh291e6fc92994ebep169f6djsn6468bdf8ea71', // Akun Baru 1 (Utama sekarang)
    '7095d94fbamshbbec24ad251fd30p1f2b8fjsnb78470892218', // Akun Baru 2 (Cadangan Pertama)
    '937d750ff1msh90d3afecabf1714p10cbe5jsna5bc5d8d048c', // Akun Lama 1 (Nunggu reset bulan depan)
    'bcbaddf86bmshec9743f2eb27790p1cbf3ajsnfa15a73d34fb', // Akun Lama 2 (Nunggu reset bulan depan)
    '53e8414702msh6aab12dd31d3234p149546jsna80ea3f770ec'  // Akun Lama 3 (Nunggu reset bulan depan)
];

// Memory untuk nginget sistem lagi pakai akun nomor berapa
let currentKeyIndex = 0; 

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    console.log(`[▶️] OPERASI ROTASI VIP ID: ${videoId}`);

    const rapidApiHost = 'youtube-mp36.p.rapidapi.com';
    const rapidApiUrl = `https://${rapidApiHost}/dl?id=${videoId}`;

    let audioUrl = null;
    let attempts = 0;

    // Mesin bakal nyoba terus maksimal 5 kali (sesuai jumlah total akun lu)
    while (attempts < apiKeys.length) {
        const activeKey = apiKeys[currentKeyIndex];
        console.log(`Mengetuk API menggunakan Akun ke-${currentKeyIndex + 1}...`);

        try {
            const response = await fetch(rapidApiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': rapidApiHost,
                    'x-rapidapi-key': activeKey
                }
            });

            // SENSOR OTOMATIS: Kalau dapet error 429 (Kuota Habis)
            if (response.status === 429) {
                console.log(`⚠️ KUOTA AKUN KE-${currentKeyIndex + 1} HABIS! Otomatis geser ke akun cadangan...`);
                // Oper gigi ke akun selanjutnya
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                attempts++;
                continue; 
            }

            // Kalau error dari servernya mati atau down
            if (!response.ok) {
                console.log(`❌ Error Server (Status: ${response.status}), coba pakai kunci lain...`);
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                attempts++;
                continue;
            }

            const data = await response.json();
            
            // Kalau berhasil dapet link MP3-nya
            if (data && data.link) {
                audioUrl = data.link;
                break; // Lagu dapet! Hentikan perputaran
            } else {
                // Berjaga-jaga kalau respon API-nya berubah bentuk
                console.log(`⚠️ Link nggak ketemu di akun ke-${currentKeyIndex + 1}, geser lagi...`);
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                attempts++;
            }

        } catch (err) {
            console.log(`❌ Gagal koneksi di akun ke-${currentKeyIndex + 1}, lanjut geser...`);
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            attempts++;
        }
    }

    if (audioUrl) {
        console.log('✅ LINK AUDIO ROTASI DAPAT! Mengalihkan ke Vercel...');
        res.redirect(audioUrl);
    } else {
        res.status(500).send(`Gagal total! Semua kuota dari ${apiKeys.length} akun VIP lu udah habis bulan ini.`);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER ${apiKeys.length} NYAWA ROTASI JALAN DI PORT ${PORT} 🔥`);
});