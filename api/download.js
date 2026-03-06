const axios = require('axios');
const { load } = require('cheerio');

async function tiktokDownload(url) {
  const response = await axios.post('https://www.tikwm.com/api/', { url: url });

  const data = response.data;
  if (data.code !== 0) throw new Error(data.msg || 'Gagal');

  const video = data.data;
  const links = [];
  if (!video.images) {
      if (video.play) links.push({ title: 'Download Video (No Watermark)', url: video.play });
      if (video.hdplay) links.push({ title: 'Download Video HD', url: video.hdplay });
      if (video.wmplay) links.push({ title: 'Download Video (Watermark)', url: video.wmplay });
      if (video.music) links.push({ title: 'Download Audio (MP3)', url: video.music });
  } else {
      for (let i = 0; i < video.images.length; i++) {
        links.push({ title: `Download Gambar ${i + 1}`, url: video.images[i] });
      }
      links.push({ title: 'Download Audio (MP3)', url: video.music });
  }
  return { thumbnail: video.cover || null, title: video.title || '', author: video.author?.nickname || '', username: video.author?.unique_id || '' , links };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  if (!url.includes('tiktok.com')) return res.status(400).json({ error: 'Platform tidak didukung. Selain URL TikTok tidak bisa mengunduh.' });

  try {
    let result = await tiktokDownload(url);

    return res.status(200).json({ success: true, ...result });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Gagal memproses. Coba lagi.' });
  }
};
