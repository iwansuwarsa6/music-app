const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const ytDlpPath = './yt-dlp';

// 1. Fungsi Ajaib: Download yt-dlp LINUX MURNI (Bukan Script Python)
async function siapkanYtDlp() {
    if (fs.existsSync(ytDlpPath)) {
        // Hapus file lama biar kita bisa download versi Linux murni
        fs.unlinkSync(ytDlpPath); 
    }
    console.log('⏳ Mendownload yt-dlp versi BINARY LINUX dari GitHub...');

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(ytDlpPath);
        // INI KUNCI FINALNYA: Kita download "yt-dlp_linux"
        https.get('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux', (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        fs.chmodSync(ytDlpPath, 0o755);
                        console.log('✅ yt-dlp_linux siap digunakan!');
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

    const stream = spawn(ytDlpPath, [
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio',
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