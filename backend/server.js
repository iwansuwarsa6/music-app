const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// INI TIKET VIP LU YANG UDAH DIMASUKIN
const YOUTUBE_COOKIE = `VISITOR_INFO1_LIVE=gpQNdIaelD0; VISITOR_PRIVACY_METADATA=CgJJRBIEGgAgQw%3D%3D; VISITOR_INFO1_LIVE=gpQNdIaelD0; VISITOR_PRIVACY_METADATA=CgJJRBIEGgAgQw%3D%3D; __Secure-BUCKET=CNID; LOGIN_INFO=AFmmF2swRQIhALh13eYeVXZVjr-BiTjsz0FDMmAwZNltjZFxgOHgI8ExAiAkG8bf5eP4EVyhDZ0MC_vbX8OSw-nS9dryZfDXRKTNzg:QUQ3MjNmeEFpcm5JQkZxeGpobzdoaGFDUTZEcklCUlJ4WWZWS1VjenRtLTNINjlFT1pid1NoeU0xbnM3UkxSTWNlQkFZT1I0WktFWHJSbWNZQ1Fuc2pBNE5pb3gwSDB0Mjh3aC15ZEdnRFZOaWdKTUVObnB4MUR6aFpteVRSbThXSl9RRXZHTVFpQW5VTjhzNlFJMUMyeXA2UVlhc2o4MmhR; PREF=f4=4000000&f6=40000000&tz=Asia.Jakarta&f7=100&repeat=NONE&autoplay=true; SID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJXcIwPx2YfiVlFlSohE9iZgwACgYKAQsSARISFQHGX2Mi2WJ-tmUl8DJ-BiqBEv6obBoVAUF8yKo0C3hH2C6uZei1sAOKh-2E0076; __Secure-1PSID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJXiBa53yl-M-nBTDBmM8-5KAACgYKARsSARISFQHGX2MiuGuNUFhCj1mMpE4-6_6oZxoVAUF8yKquCLFWp4M3SKXPXHlZrFAy0076; __Secure-3PSID=g.a000_wgVgh4JVCAQSlpTQgPOzjuluUjj2Tg1rctPCjBXQwuxavJX5-8ecac07GCx_3CGphW7wwACgYKAR8SARISFQHGX2Mi0NDUGV80JZVmCMbaZekdFRoVAUF8yKpXM6SWC51zQaxTn6XBJbSf0076; HSID=AhOthtHEp7At6QWjh; SSID=AOLMp3hazBip_oNpt; APISID=vj_Fl7lJ92Wi4WwB/AZdmIq2_UeJB9IgB2; SAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; __Secure-1PAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; __Secure-3PAPISID=Ldp-Dxq5Z5L1cazS/A-dVmSEIcGq-O1S6m; YSC=vgtBBhth36o; _gcl_au=1.1.342691267.1784378860; _ga=GA1.1.449953131.1784378894; __Secure-YNID=20.YT=rGMU6d5nJE6gJPmvZ6JUWjiVAMSmdcpNGOGMfWFwHLcnF2E5xh2dkkQxxlo7LhuKnNQNBj0IhUeZR2vpbESGV6ZNEaNHQmQZV5yeTuw_4QNReE1EyeO7bvJSEooXUeUQEKBiyGcuMElNwDdJKNKLPCNUQjaVyjFHywlErO7c6UlNnp_-IdDCamPdl7XltK_bL7_hVyhZBwdihkXoJ2leISqL0CS6wmtC8xHwa4_uwyUCUc8GdtAqEjLGb_UNo7lcEtQm_MAzHPeCEZ3Tl02hXkK9f2TvA-MTK5JcG8Q1Wyc8eVKo4QhYyI6PBDZKz0hsBw2J5kR9NeWRX5nUFx-58g; _ga_VCGEPY40VB=GS2.1.s1784390995$o2$g0$t1784390995$j60$l0$h0; __Secure-ROLLOUT_TOKEN=COng6eHKvNTMhwEQvYXl_Z7LkwMYlq3344velQM%3D; __Secure-YNID=20.YT=CYoF-Zn_2gyq-tFSJ1TkcTtoLL-CLkvLStIg2EyAkEYhU46X19m9gFrX6csKjPPifjaNHMosRUwYzfR2RPIw424ihcVy0thqM8BKkJWv-8VE-SKNtuCLkLrADojpDxHsmP1mHXwFqZGI9pMqc0L4r9Gr-pHr0fgWnp24CDTNvSk4QX9gYkwDp2S47-ybS_FnxZZuQjbg1JeITippwRPnAPouKkWgpsjBC5zm5JGE5MRXSC4ZQtdPMfkw60Fyr1r2BHjaolXVAdyBXg2zpb_XbYs7_CppHnQpVgMaa5KO3eeEGcWKJ_tg63IER-_5m8pP8sWtFgAE9D7AVxbvNTbvvA; __Secure-1PSIDTS=sidts-CjcBPWEu2W0XnW3JktpOHD_zn2_QLen7qZZjsGBZsuVwri5WNuBh5mfhuh3qKRXLAtIj5OHgq4VzEAA; __Secure-1PSIDRTS=sidts-CjcBPWEu2W0XnW3JktpOHD_zn2_QLen7qZZjsGBZsuVwri5WNuBh5mfhuh3qKRXLAtIj5OHgq4VzEAA; __Secure-3PSIDTS=sidts-CjcBPWEu2W0XnW3JktpOHD_zn2_QLen7qZZjsGBZsuVwri5WNuBh5mfhuh3qKRXLAtIj5OHgq4VzEAA; __Secure-3PSIDRTS=sidts-CjcBPWEu2W0XnW3JktpOHD_zn2_QLen7qZZjsGBZsuVwri5WNuBh5mfhuh3qKRXLAtIj5OHgq4VzEAA; SIDCC=AKEyXzUsjvp1xvsc2w2b70CYevjpA1sR4NwvzxXxBqsqLI2fJ4cuMclt8TlTbggxnAMs8iLPoKU; __Secure-1PSIDCC=AKEyXzV3GRIzspUP2_DhsZbpuAzVMAG2jUFzq7fLc86_AgS2tbra1vDWrGe1LPvsPBRJzqLvHA; __Secure-3PSIDCC=AKEyXzVsc_2U-JPJHvgTfV3cATE2L_8Qpp9xSgMd3KGFIx_t4X8L01FZkgiYu3zAqItnj7t5bKI`;

app.get('/api/audio', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID kosong');

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[▶️] STREAMING lagu ID: ${videoId} pakai ytdl-core + COOKIES VIP...`);

    try {
        // Cek dulu apakah YouTube nerima URL ini
        if (!ytdl.validateURL(url)) {
            console.error('URL Ditolak sama ytdl-core');
            return res.status(400).send('URL tidak valid');
        }

        res.setHeader('Content-Type', 'audio/webm');

        // Kita suntik KTP/Cookies lu ke request biar YouTube ngira ini laptop lu
        const stream = ytdl(url, {
            filter: 'audioonly',
            requestOptions: {
                headers: {
                    cookie: YOUTUBE_COOKIE
                }
            }
        });

        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('PROSES GAGAL (YTDL-CORE ERROR):', err.message);
            if (!res.headersSent) res.status(500).send('Gagal streaming lagu');
        });

        req.on('close', () => {
            stream.destroy();
        });

    } catch (error) {
        console.error('PROSES GAGAL (SISTEM):', error.message);
        if (!res.headersSent) res.status(500).send('Terjadi kesalahan internal');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 SERVER JALAN DI PORT ${PORT} 🔥`);
});