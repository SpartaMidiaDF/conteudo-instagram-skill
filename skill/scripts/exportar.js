// Exporta um carrossel aprovado: cada .slide do #track vira PNG 1080×1350 em "6 - Conteudo Aprovado/NN - <headline>/",
// junto com legenda.txt (seção "### Legenda" da ficha .md de mesmo nome do .html).
// uso: node exportar.js <previa.html> "<headline>" [pasta-base]   (pasta-base diferente = teste, não numera no acervo)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const W = require('./ws');
const [, , html, headline, baseArg] = process.argv;
if (!html || !headline) { console.error('uso: node exportar.js <previa.html> "<headline>" [pasta-base]'); process.exit(1); }
const base = baseArg || W.pasta('aprovado');
fs.mkdirSync(base, { recursive: true });
const out = path.join(base, `${W.proximo(base)} - ${W.nomeSeguro(headline)}`);
fs.mkdirSync(out);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1500 } });
  await page.goto('file:///' + path.resolve(html).replace(/\\/g, '/'));
  await page.addStyleTag({ content: `.track { display: block !important; overflow: visible !important; }
    .track > .slide { display: block !important; width: 1080px !important; max-width: none !important; margin: 0 0 40px !important; border-radius: 0 !important; box-shadow: none !important; }` });
  await page.evaluate(() => document.fonts.ready);
  const slides = await page.$$('#track > .slide');
  for (let i = 0; i < slides.length; i++) {
    await slides[i].scrollIntoViewIfNeeded();
    await slides[i].screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}.png`) });
  }
  await browser.close();
  const ficha = html.replace(/\.html?$/i, '.md');
  const leg = fs.existsSync(ficha) && fs.readFileSync(ficha, 'utf8').match(/### Legenda\s*\n([\s\S]*?)(?=\n### |$)/);
  if (leg) fs.writeFileSync(path.join(out, 'legenda.txt'), leg[1].trim() + '\n', 'utf8');
  else console.warn('aviso: ficha .md sem "### Legenda" — legenda.txt não criada');
  console.log(`${slides.length} slides${leg ? ' + legenda.txt' : ''} → ${out}`);
})().catch(e => { console.error(e); process.exit(1); });
