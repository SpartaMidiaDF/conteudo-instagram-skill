// Recorta foto de produto -> PNG transparente, aparado em volta do produto.
// uso: node recorte.js <entrada.png|jpg|webp> <saida.png> [modo]
//   modo = ia        (padrão) IA local (imgly/ONNX, sem internet) separa o produto de qualquer fundo
//                    (cenário, mapa, água, textura); depois a limpeza abaixo tira os restos.
//   modo = <número>  sem IA, para fundo branco liso: apaga o "quase branco" ligado às bordas
//                    (200 = padrão; suba para 240+ se o produto tiver partes brancas na borda).
// Nos dois modos: mantém só o maior objeto (descarta ícones, pinos, logos, acessórios soltos) e apara a imagem.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const [, , input, output, modo = 'ia'] = process.argv;
if (!input || !output) { console.error('uso: node recorte.js <entrada> <saida.png> [ia|limite]'); process.exit(1); }

(async () => {
  let buf = fs.readFileSync(path.resolve(input));
  const ia = modo === 'ia';
  if (ia) {
    const { removeBackground } = require('@imgly/background-removal-node');
    const sig = buf.subarray(0, 4).toString('hex');
    const type = sig.startsWith('89504e47') ? 'image/png' : sig.startsWith('ffd8') ? 'image/jpeg' : 'image/webp';
    const blob = await removeBackground(new Blob([buf], { type }), { model: 'medium', output: { format: 'image/png' } });
    buf = Buffer.from(await blob.arrayBuffer());
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'data:image/png;base64,' + buf.toString('base64'); // o Chromium detecta o formato real
  const b64 = await page.evaluate(async ([url, ia, lim]) => {
    const img = new Image(); img.src = url; await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, w, h), p = d.data, N = w * h;
    // 1) máscara de fundo
    const bg = new Uint8Array(N);
    if (ia) { for (let i = 0; i < N; i++) bg[i] = p[i*4+3] < 110 ? 1 : 0; }   // IA: o que ela deixou quase transparente
    else {                                                                     // sem IA: inundação a partir das bordas
      const isBg = i => { const r = p[i*4], g = p[i*4+1], b = p[i*4+2];
        return Math.min(r, g, b) > lim && Math.max(r, g, b) - Math.min(r, g, b) < 30 || Math.max(r, g, b) < 28; };
      const st = [];
      for (let i = 0; i < w; i++) st.push(i, (h - 1) * w + i);
      for (let j = 0; j < h; j++) st.push(j * w, j * w + w - 1);
      while (st.length) { const i = st.pop(); if (bg[i] || !isBg(i)) continue; bg[i] = 1;
        const X = i % w, Y = (i / w) | 0;
        if (X > 0) st.push(i - 1); if (X < w - 1) st.push(i + 1); if (Y > 0) st.push(i - w); if (Y < h - 1) st.push(i + w); }
    }
    // 2) maior objeto = produto
    const lab = new Int32Array(N); let best = 0, bestSize = 0, id = 0;
    for (let s = 0; s < N; s++) { if (bg[s] || lab[s]) continue; id++; let size = 0; const q = [s]; lab[s] = id;
      while (q.length) { const i = q.pop(); size++; const X = i % w, Y = (i / w) | 0;
        for (const n of [X > 0 ? i - 1 : -1, X < w - 1 ? i + 1 : -1, Y > 0 ? i - w : -1, Y < h - 1 ? i + w : -1])
          if (n >= 0 && !bg[n] && !lab[n]) { lab[n] = id; q.push(n); } }
      if (size > bestSize) { bestSize = size; best = id; } }
    // 3) alfa: fora do produto = 0. Sem IA, borda clara vira semitransparente (suaviza o halo branco);
    //    com IA, a borda já vem suave e é mantida.
    for (let i = 0; i < N; i++) {
      if (lab[i] !== best) { p[i*4+3] = 0; continue; }
      if (ia) continue;
      const X = i % w, Y = (i / w) | 0;
      const edge = (X > 0 && lab[i-1] !== best) || (X < w-1 && lab[i+1] !== best) || (Y > 0 && lab[i-w] !== best) || (Y < h-1 && lab[i+w] !== best);
      if (edge && Math.min(p[i*4], p[i*4+1], p[i*4+2]) > 170) p[i*4+3] = 90;
    }
    x.putImageData(d, 0, 0);
    // 4) apara a área vazia em volta
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let i = 0; i < N; i++) if (lab[i] === best) { const X = i % w, Y = (i / w) | 0; if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; }
    const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
    o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png').split(',')[1];
  }, [url, ia, +modo || 200]);
  fs.writeFileSync(output, Buffer.from(b64, 'base64'));
  await browser.close();
  console.log(`recortado (${ia ? 'IA' : 'fundo liso'}) →`, output);
})().catch(e => { console.error(e); process.exit(1); });
