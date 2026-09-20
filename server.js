// server.js — tiny backend: serves your site and saves data to data.json
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '10mb' })); // 10mb so the logo photo fits

// ---- Clean the incoming data so bad/unsafe values can't be stored ----
function text(v, max){ return String(v ?? '').slice(0, max); }
function cleanUrl(v){
  try{
    const u = new URL(String(v));
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
  }catch(e){ return ''; }
}
function clean(body){
  if(!body || !Array.isArray(body.links)) return null;
  const links = body.links.slice(0, 100).map(l => ({
    id: text(l.id, 60),
    platform: text(l.platform, 30),
    title: text(l.title, 100),
    url: cleanUrl(l.url),
    visible: !!l.visible,
  })).filter(l => l.id && l.url);
  const logo = (typeof body.logo === 'string' && body.logo.startsWith('data:image/')) ? body.logo : '';
  return {
    links,
    about: { en: text(body.about && body.about.en, 2000), ku: text(body.about && body.about.ku, 2000) },
    siteTitle: text(body.siteTitle, 100) || 'HCode Studio',
    tagline: text(body.tagline, 200),
    logo,
  };
}

// ---- API ----
app.get('/api/data', (req, res) => {
  try{
    if(!fs.existsSync(DATA_FILE)) return res.json(null); // nothing saved yet
    res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  }catch(e){
    res.status(500).json({ error: 'Could not read data' });
  }
});

app.post('/api/data', (req, res) => {
  const data = clean(req.body);
  if(!data) return res.status(400).json({ error: 'Bad data' });
  try{
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, DATA_FILE); // safe write: never leaves a half-written file
    res.json({ ok: true });
  }catch(e){
    res.status(500).json({ error: 'Could not save data' });
  }
});

// ---- Your website files (the "public" folder) ----
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Running:  http://localhost:${PORT}`);
  console.log(`Admin:    http://localhost:${PORT}/admin.html`);
});