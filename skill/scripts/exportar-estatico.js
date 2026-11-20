// Exporta posts estáticos aprovados: cada .slide[data-nome] vira "E### - <nome>.png" (1080×1350) + ".txt" com a legenda,
// em "6 - Conteudo Aprovado/Estaticos/". Se o post veio do banco de frases, marca "usada_em" no banco.
// uso: node exportar-estatico.js <previa.html> [pasta-destino]   (pasta diferente = teste, não marca o banco)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const W = require('./ws');
const [, , html, destArg] = process.argv;
if (!html) { console.error('uso: node exportar-estatico.js <previa.html> [pasta-destino]'); process.exit(1); }
const oficial = W.pasta('aprovado', 'Estaticos');
const out = destArg || oficial;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1500 } });
  await page.goto('file:///' + path.resolve(html).replace(/\\/g, '/'));
  await page.addStyleTag({ content: `.grid { display: block !important; } figcaption { display: none !important; }
    .slide { width: 1080px !important; max-width: none !important; margin-bottom: 40px !important; border-radius: 0 !important; box-shadow: none !important; }` });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForFunction(() => document.documentElement.dataset.pronto === '1');
  await page.waitForTimeout(300);
  const usados = [];
  for (const s of await page.$$('.slide[data-nome]')) {
    const nome = `E${W.proximo(out, 3)} - ${await s.getAttribute('data-nome')}`;
    await s.scrollIntoViewIfNeeded();
    await s.screenshot({ path: path.join(out, nome + '.png') });
    fs.writeFileSync(path.join(out, nome + '.txt'), (await s.getAttribute('data-legenda')) + '\n', 'utf8');
    const id = nome.match(/ - F(\d+) /)?.[1]; if (id) usados.push(id);
    console.log(nome);
  }
  await browser.close();
  const bancoArq = W.pasta('base', 'banco-frases.json');
  if (path.resolve(out) === path.resolve(oficial) && usados.length && fs.existsSync(bancoArq)) {
    const banco = JSON.parse(fs.readFileSync(bancoArq, 'utf8')); const hoje = new Date().toISOString().slice(0, 10);
    for (const d of banco) if (usados.includes(d.id)) d.usada_em = hoje;
    fs.writeFileSync(bancoArq, JSON.stringify(banco, null, 1));
    console.log(`banco de frases: ${usados.length} marcadas como usadas em ${hoje}`);
  }
  console.log('→ ' + out);
})().catch(e => { console.error(e); process.exit(1); });
