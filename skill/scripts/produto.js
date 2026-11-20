// Lê produtos de uma exportação de produtos da Shopify (CSV) — padrão: "3 - Base de Conhecimento/produtos.csv".
// uso: node produto.js "<trecho do título ou handle>" [--fotos <pasta>] [--csv <arquivo>]
//   sem --fotos: título, handle, preço/variantes, "Porque levar" (se existir), descrição e URLs das fotos
//   com --fotos: baixa as fotos (?width=1100) como f1.img, f2.img... na ordem da loja
const fs = require('fs');
const path = require('path');
const W = require('./ws');
const a = process.argv.slice(2);
const busca = a[0]; const iF = a.indexOf('--fotos'), iC = a.indexOf('--csv');
const pastaFotos = iF > -1 ? a[iF + 1] : null;
const CSV = iC > -1 ? a[iC + 1] : W.pasta('base', 'produtos.csv');
if (!busca) { console.error('uso: node produto.js "<trecho>" [--fotos <pasta>] [--csv <arquivo>]'); process.exit(1); }
if (!fs.existsSync(CSV)) { console.error('CSV de produtos não encontrado: ' + CSV); process.exit(1); }

function parse(t) { const rows = []; let r = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { r.push(f); f = ''; } else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; } else if (c !== '\r') f += c; }
  if (f || r.length) { r.push(f); rows.push(r); } return rows; }
const rows = parse(fs.readFileSync(CSV, 'utf8').replace(/^﻿/, ''));
const h = rows[0]; const col = n => h.findIndex(x => x.startsWith(n));
const C = { handle: col('Handle'), title: col('Title'), body: col('Body (HTML)'), pub: col('Published'), opt: col('Option1 Value'), price: col('Variant Price'), cmp: col('Variant Compare At Price'), img: col('Image Src'), why: col('Porque levar') };
const P = {};
for (const r of rows.slice(1)) { const k = r[C.handle]; if (!k) continue; const p = P[k] ||= { handle: k, variantes: [], fotos: [] };
  if (r[C.title]) Object.assign(p, { titulo: r[C.title], body: r[C.body], publicado: r[C.pub], porque: C.why > -1 ? r[C.why] : '' });
  if (r[C.price]) p.variantes.push(`${r[C.opt] || 'padrão'}: ${r[C.price]}${r[C.cmp] ? ` (de ${r[C.cmp]})` : ''}`);
  if (r[C.img]) p.fotos.push(r[C.img].split('?')[0]); }
const q = busca.toLowerCase();
const achados = Object.values(P).filter(p => p.handle.includes(q) || (p.titulo || '').toLowerCase().includes(q));
if (!achados.length) { console.error('nenhum produto encontrado para', busca); process.exit(1); }
const texto = s => (s || '').replace(/<\/(p|li|h\d)>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();

(async () => {
  if (pastaFotos) {
    const p = achados[0]; fs.mkdirSync(pastaFotos, { recursive: true });
    for (const [i, u] of p.fotos.entries()) fs.writeFileSync(path.join(pastaFotos, `f${i + 1}.img`), Buffer.from(await (await fetch(u + '?width=1100')).arrayBuffer()));
    console.log(`${p.fotos.length} fotos de "${p.titulo}" → ${pastaFotos}`); return;
  }
  for (const p of achados.slice(0, 5))
    console.log(`\n=== ${p.titulo}\nhandle: ${p.handle} · publicado: ${p.publicado}\nvariantes: ${p.variantes.join(' | ')}${p.porque ? `\nporque levar:\n${p.porque}` : ''}\n--- descrição\n${texto(p.body).slice(0, 2600)}\n--- ${p.fotos.length} fotos`);
})().catch(e => { console.error(e); process.exit(1); });
