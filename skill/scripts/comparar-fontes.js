// Renderiza a mesma frase em várias fontes do Google para comparar com uma referência de design.
// uso: node comparar-fontes.js "<frase>" <saida.png> "Fonte 1" "Fonte 2" ... [--fundo #hex] [--cor #hex]
// Dica: recorte a referência no mesmo enquadramento e compare lado a lado; escolha a mais parecida e grave no marca.json.
const { chromium } = require('playwright');
const a = process.argv.slice(2);
const opt = k => { const i = a.indexOf(k); if (i < 0) return null; const v = a[i + 1]; a.splice(i, 2); return v; };
const fundo = opt('--fundo') || '#1c1424', cor = opt('--cor') || '#ffffff';
const [frase, saida, ...fontes] = a;
if (!frase || !saida || !fontes.length) { console.error('uso: node comparar-fontes.js "<frase>" <saida.png> "Fonte 1" "Fonte 2" ...'); process.exit(1); }
const fams = fontes.map(f => 'family=' + f.replace(/ /g, '+')).join('&');
const cols = Math.min(4, fontes.length), rows = Math.ceil(fontes.length / cols);
const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fams}&display=swap">
<style>body{margin:0;background:${fundo};display:grid;grid-template-columns:repeat(${cols},540px)}div{height:440px;color:${cor};font-size:84px;line-height:.92;letter-spacing:-.02em;text-align:center;padding:24px 18px 0;box-sizing:border-box;position:relative;overflow:hidden}small{position:absolute;bottom:6px;left:0;right:0;font:20px sans-serif;opacity:.8}</style>
${fontes.map(f => `<div style="font-family:'${f}'">${frase}<small>${f}</small></div>`).join('')}`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540 * cols, height: 440 * rows } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await p.screenshot({ path: saida }); await b.close(); console.log(`${fontes.length} fontes → ${saida}`);
})().catch(e => { console.error(e); process.exit(1); });
