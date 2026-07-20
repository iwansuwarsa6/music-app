const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const ytDlpPath = './yt-dlp';

// 1. Fungsi Ajaib: Download yt-dlp langsung pakai JS
async function siapkanYtDlp() {
    if (fs.existsSync(ytDlpPath)) return;
    console.log('⏳ Mendownload yt-dlp murni dari GitHub...');

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(ytDlpPath);
        https.get('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp', (res) => {
            // GitHub selalu ngeredirect (302) ke file aslinya, kita ikuti alurnya
            if (res.statusCode === 302 || res.statusCode === 301) {
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        fs.chmodSync(ytDlpPath, 0o755); // Kasih izin eksekusi (chmod +x)
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

    // Kita balikin ke cara panggil normal tanpa "python3"
    const stream = spawn(ytDlpPath, [
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio',
        '-o', '-'
    ]);

    stream.stdout.pipe(res);

    // Penangkap log error tetep hidup biar kita tau kalau ada masalah
    stream.stderr.on('data', (data) => {
        console.error(`[YT-DLP LOG]: ${data.toString().trim()}`);
    });

    stream.on('error', (err) => {
        console.error('❌ PROSES GAGAL SPAWN:', err.message);
        if (!res.headersSent) res.status(500).send('Gagal memutar lagu');
    });

    req.on('close', () => stream.kill());
});

// 3. Nyalakan server HANYA SETELAH yt-dlp selesai didownload
siapkanYtDlp().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
    });
}).catch(err => {
    console.error('Gagal menyiapkan sistem:', err);
});