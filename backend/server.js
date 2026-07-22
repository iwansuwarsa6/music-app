const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 INI DIA 14 NYAWA VIP LU SEKARANG (TOTAL 7.000 REQUEST/BULAN) 🔥
const apiKeys = [
    // --- 5 Akun Lama ---
    'f4e914fa55msh291e6fc92994ebep169f6djsn6468bdf8ea71', 
    '7095d94fbamshbbec24ad251fd30p1f2b8fjsnb78470892218', 
    '937d750ff1msh90d3afecabf1714p10cbe5jsna5bc5d8d048c', 
    'bcbaddf86bmshec9743f2eb27790p1cbf3ajsnfa15a73d34fb', 
    '53e8414702msh6aab12dd31d3234p149546jsna80ea3f770ec',
    // --- 9 Akun Baru (Hasil Panen Trik Googlemail) ---
    'f9290b3b7amshcd2e40de4f9b764p183576jsn1f87451eb25c',
    'f2b80f5a88msheb34d6fe043221ap180fc5jsn04038bd1e76a',
    '8e47420f4bmsh5a8cb3ccd37e3b0p17773bjsnaada21063b96',
    'ae399e0ca5msh998713133c2a58ep1b203fjsnbe2cdaf14268',
    'bf1e8c083bmsh60de0aa35e66337p1f2bc1jsn122d7f671f15',
    'e9d49e2db8mshd0df9bbbee5ce26p1bc8d6jsn88590c8293df',
    '79255ed5d1msh07305152a465183p18b944jsn0dc9959e017d',
    '30496e0f53msh3ef636b039b4718p1a51ecjsn0b231b3b636e',
    '09cb701317msh848e322d04fa0a0p1eadd4jsnbfe3d0b5ca51'
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

    // Mesin bakal nyoba terus maksimal sesuai jumlah total akun (14 kali)
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
        console.log('✅ LINK AUDIO ROTASI DAPAT! Mengalihkan...');
        res.redirect(audioUrl);
    } else {
        res.status(500).send(`Gagal total! Semua kuota dari ${apiKeys.length} akun VIP lu udah habis bulan ini.`);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER ${apiKeys.length} NYAWA ROTASI JALAN DI PORT ${PORT} 🔥`);
});