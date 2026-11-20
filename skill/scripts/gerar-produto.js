// Carrossel de PRODUTO, modelo panorama: fundo escuro, um slide claro de respiro, título pesado + texto itálico,
// foto do produto recortada atravessando a divisa entre slides. Cores, fontes, @ e avatar vêm do marca.json.
// uso: node gerar-produto.js <spec.json> [saida.html]
// spec: { "titulo": "...", "palavra": "...", "persona": "...",
//   "fotos": { "a": { "arq": "x-recorte-1.png", "w": 57, "h": 95, "top": 22, "rot": 0 } },   // arquivos em "5 - Conteudo Pre Aprovado/assets"; medidas em cqw
//   "slides": [
//     { "tipo": "capa",    "titulo": "... <pk>destaque</pk> ...", "sub": "linha1<br>linha2", "tam": 12.2, "col": "right:24cqw" },
//     { "tipo": "texto",   "titulo": "...", "corpo": ["..."], "cap": "...", "seta": "l|r|", "col": "right:34cqw", "fotos": [{ "id": "a", "left": 68 }], "branco": false, "tam": 8.6 },
//     { "tipo": "produto", "pre": "Conheça o", "nome": "X<pk>Y.</pk>", "sub": "...", "chips": ["..."], "cap": "...", "seta": "r", "col": "left:34cqw;right:6cqw", "who": "left:34cqw", "fotos": [{ "id": "a", "left": -32 }] },
//     { "tipo": "passos",  "titulo": "...", "itens": ["..."], "col": "...", "who": "...", "fotos": [...], "seta": "r" },
//     { "tipo": "cta",     "titulo": "...", "botao": "Comente PALAVRA", "corpo": "...", "col": "...", "logo": true } ] }
// <pk>…</pk> = cor de acento · <b>…</b> = negrito. Mesma foto em slides vizinhos com left X e X-100 = atravessa a divisa.
const fs = require('fs');
const path = require('path');
const W = require('./ws');
const [, , specArq, saidaArg] = process.argv;
if (!specArq) { console.error('uso: node gerar-produto.js <spec.json> [saida.html]'); process.exit(1); }
const S = JSON.parse(fs.readFileSync(specArq, 'utf8'));
const M = W.marca(); const C = M.cores, F = M.fontes;
const saida = saidaArg || specArq.replace(/\.spec\.json$/i, '.html');
const ASSETS = W.pasta('pre', 'assets');

const md = s => W.censura(M, s || '').replace(/<pk>/g, '<span class="pk">').replace(/<\/pk>/g, '</span>').replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>');
const seta = (lado, escura) => !lado ? '' : `<span class="go ${lado}"><svg viewBox="0 0 40 20" fill="none" stroke="${escura ? C.escuro : C.acento}" stroke-width="2" stroke-linecap="round"><path d="M2 10h35M29 3l8 7-8 7"/></svg></span>`;
const who = (pos, estatico) => `<div class="who"${estatico ? ' style="position:static;margin-bottom:7cqw"' : pos ? ` style="${pos}"` : ''}><span class="av"></span>@${W.esc(M.arroba)}</div>`;
const fotos = l => (l || []).map(f => `<div class="ph ph-${f.id}" style="left:${f.left}cqw${f.top != null ? `;top:${f.top}cqw` : ''}"></div>`).join('');
const corpo = (arr, primeiro = 6) => (arr || []).map((t, i) => `<p class="b"${i === 0 ? ` style="margin-top:${primeiro}cqw"` : ''}>${md(t)}</p>`).join('');
const logo = `<span class="logo">${W.esc(M.inicial)}</span>`;

const slide = s => {
  const cls = `slide${s.branco ? ' white' : ''}`, col = s.col ? ` style="${s.col}"` : '', tam = s.tam || 8.6;
  switch (s.tipo) {
    case 'capa': return `<article class="${cls}">${logo}${fotos(s.fotos)}<div class="col"${col}><p class="t" style="font-size:${s.tam || 12.2}cqw">${md(s.titulo)}</p>
        <p class="b" style="font-size:5.2cqw;line-height:.95;margin-top:7cqw">${md(s.sub)}</p></div>${seta(s.seta ?? 'r')}</article>`;
    case 'texto': return `<article class="${cls}">${who(s.who)}${fotos(s.fotos)}<div class="col"${col}><p class="t" style="font-size:${tam}cqw">${md(s.titulo)}</p>${corpo(s.corpo, s.espaco ?? 6)}${s.cap ? `<p class="cap">${md(s.cap)}</p>` : ''}</div>${seta(s.seta, s.branco)}</article>`;
    case 'produto': return `<article class="${cls}">${who(s.who)}${fotos(s.fotos)}<div class="col"${col}><p class="t" style="font-size:${tam}cqw">${md(s.pre)} ${md(s.nome)}</p>
        <p class="b" style="font-size:5cqw;margin-top:4cqw">${md(s.sub)}</p><div class="chips">${(s.chips || []).map(c => `<span>${W.esc(c)}</span>`).join('')}</div>${s.cap ? `<p class="cap">${md(s.cap)}</p>` : ''}</div>${seta(s.seta, s.branco)}</article>`;
    case 'passos': return `<article class="${cls}">${who(s.who)}${fotos(s.fotos)}<div class="col"${col}><p class="t" style="font-size:${tam}cqw">${md(s.titulo)}</p>
        <ol class="steps">${s.itens.map(i => `<li>${md(i)}</li>`).join('')}</ol>${s.cap ? `<p class="cap">${md(s.cap)}</p>` : ''}</div>${seta(s.seta, s.branco)}</article>`;
    case 'cta': return `<article class="${cls}">${s.logo ? logo : ''}${fotos(s.fotos)}<div class="col"${col}>${who(null, true)}<p class="t" style="font-size:${s.tam || 9}cqw">${md(s.titulo)}</p>
        <span class="pill">${W.esc(s.botao)}</span><p class="b" style="font-size:4.2cqw;margin-top:5cqw">${md(s.corpo)}</p></div></article>`;
    default: throw new Error('tipo de slide desconhecido: ' + s.tipo);
  }
};
const css64 = Object.entries(S.fotos || {}).map(([id, f]) =>
  `.ph-${id} { background-image: url("data:image/png;base64,${fs.readFileSync(path.join(ASSETS, f.arq)).toString('base64')}"); width: ${f.w}cqw; height: ${f.h}cqw; top: ${f.top}cqw;${f.rot ? ` transform: rotate(${f.rot}deg);` : ''} }`).join('\n');
const n = S.slides.length;

const html = `<title>${W.esc(S.titulo)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${W.linkFontes(M)}
<style>
/* Layout: prévia de carrossel de produto em panorama — slides 1080×1350 (cqw), produto atravessando a divisa;
   trilho + panorama emendado + grade. Fundo escuro da marca, slide claro de respiro, acento único. */
:root {
  --bg: #f6f2f4; --fg: #1b1520; --muted: #6e6676; --line: #e6dde3; --chip: #ffffff;
  --head: "${F.produto_titulo || F.texto}", "Segoe UI", Arial, sans-serif; --soft: "${F.detalhe || F.texto}", "Segoe UI", sans-serif; --serif: "${F.titulo}", Georgia, serif;
  --ink: ${C.escuro}; --white: ${C.claro_produto || '#ffffff'}; --pink: ${C.acento}; --cap-d: ${C.texto_claro}; --cap-l: ${C.texto_escuro};
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #121014; --fg: #f2edf3; --muted: #b0a7b6; --line: #2c2531; --chip: #1c1820; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #121014; --fg: #f2edf3; --muted: #b0a7b6; --line: #2c2531; --chip: #1c1820; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.wrap { max-width: 1120px; margin: 0 auto; padding-block: 28px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 28px; }
header h1 { font-family: var(--serif); font-weight: 400; font-size: clamp(28px, 4vw, 40px); margin: 0 0 6px; text-wrap: balance; }
header p { margin: 0; color: var(--muted); max-width: 65ch; line-height: 1.5; }
.meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.meta span { font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); background: var(--chip); padding: 5px 10px; border-radius: 999px; }
.viewer { display: grid; gap: 14px; }
.track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; scrollbar-width: thin; }
.track > .slide { flex: 0 0 min(440px, 86%); scroll-snap-align: start; }
.controls { display: flex; align-items: center; gap: 12px; }
.controls button { font: 600 14px system-ui, sans-serif; color: var(--fg); background: var(--chip); border: 1px solid var(--line); border-radius: 999px; padding: 9px 16px; cursor: pointer; }
.controls button:focus-visible, .track:focus-visible, .pano:focus-visible { outline: 2px solid var(--pink); outline-offset: 3px; }
.controls .count { color: var(--muted); font-variant-numeric: tabular-nums; font-size: 14px; }
h2 { font-family: var(--serif); font-weight: 400; font-size: 24px; margin: 8px 0 4px; }
.hint { color: var(--muted); margin: 0 0 12px; font-size: 14px; }
.pano { display: flex; overflow-x: auto; padding-bottom: 6px; }
.pano > .slide { flex: 0 0 300px; border-radius: 0; box-shadow: none; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }

.slide { aspect-ratio: 4 / 5; max-width: 100%; container-type: inline-size; position: relative; overflow: hidden; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.10); background: var(--ink); color: #fff; font-family: var(--head); }
.slide.white { background: var(--white); color: var(--ink); }
.col { z-index: 1; position: absolute; top: 0; bottom: 0; left: 10cqw; right: 8cqw; display: flex; flex-direction: column; justify-content: center; }
.who { position: absolute; left: 10cqw; top: 7cqw; display: flex; align-items: center; gap: 2.2cqw; font: 500 2.6cqw var(--soft); z-index: 1; }
.av { width: 7.4cqw; height: 7.4cqw; border-radius: 50%; border: .3cqw solid var(--pink); display: grid; place-items: center; font: 5cqw/1 var(--serif); color: var(--pink); flex: none;
  ${M.avatarData ? `background: var(--ink) url("${M.avatarData}") center/cover;` : ''} }
.av::after { content: "${M.avatarData ? '' : W.esc(M.inicial)}"; }
.white .av { border-color: var(--ink); }
.logo { position: absolute; right: 9cqw; top: 8cqw; font: 10cqw/1 var(--serif); color: var(--pink); z-index: 1; }
.t { font-weight: 800; letter-spacing: -.035em; line-height: .86; margin: 0; }
.t .pk { color: var(--pink); }
.b { font-style: italic; font-weight: 400; font-size: 4.6cqw; line-height: 1.45; margin: 0; letter-spacing: -.005em; }
.b strong { font-weight: 700; }
.b + .b { margin-top: 4cqw; }
.cap { font: 400 3cqw/1.3 var(--soft); color: var(--cap-d); opacity: .85; margin: 5.5cqw 0 0; letter-spacing: .01em; }
.white .cap { color: var(--cap-l); }
.go { position: absolute; bottom: 7.5cqw; width: 12cqw; height: 7.4cqw; border: .45cqw solid var(--pink); border-radius: 999px; display: grid; place-items: center; z-index: 1; }
.go svg { width: 6cqw; height: 3.2cqw; }
.white .go { border-color: var(--ink); }
.go.l { left: 10cqw; } .go.r { right: 9cqw; }
.chips { display: flex; flex-direction: column; align-items: flex-start; gap: 2.2cqw; margin-top: 5.5cqw; }
.chips span { font: 500 3.3cqw/1 var(--soft); text-transform: uppercase; letter-spacing: .02em; border: .4cqw solid var(--pink); border-radius: 999px; padding: 2cqw 4cqw; }
.pill { align-self: flex-start; font-style: italic; font-weight: 400; font-size: 4.8cqw; text-transform: uppercase; border: .45cqw solid var(--pink); border-radius: 999px; padding: 2.2cqw 4.6cqw; margin-top: 5cqw; }
.steps { margin: 6cqw 0 0; padding-left: 6cqw; display: grid; gap: 4cqw; font-style: italic; font-size: 4.2cqw; line-height: 1.4; }
.steps strong { font-weight: 700; }
.steps li::marker { font-style: normal; font-weight: 800; color: var(--pink); }
.ph { position: absolute; pointer-events: none; background: center/contain no-repeat; }
${css64}
</style>

<div class="wrap">
  <header>
    <h1>${W.esc(S.titulo)}</h1>
    <p>Carrossel de produto de @${W.esc(M.arroba)} no modelo panorama (${n} slides, 1080×1350). Veja a emenda das fotos no panorama abaixo do trilho.</p>
    <div class="meta"><span>Modelo produto · panorama</span>${S.persona ? `<span>Persona ${W.esc(S.persona)}</span>` : ''}${S.palavra ? `<span>Palavra-chave: ${W.esc(S.palavra)}</span>` : ''}</div>
  </header>
  <section class="viewer" aria-label="Carrossel">
    <div class="track" id="track" tabindex="0">
      ${S.slides.map(slide).join('\n      ')}
    </div>
    <div class="controls"><button type="button" id="prev">← Anterior</button><button type="button" id="next">Próximo →</button><span class="count" id="count">1 / ${n}</span></div>
  </section>
  <section><h2>Panorama emendado</h2><p class="hint">Os ${n} slides lado a lado, sem espaço, como a pessoa vê ao deslizar.</p><div class="pano" id="pano" tabindex="0"></div></section>
  <section><h2>Todos os slides</h2><div class="grid" id="grid"></div></section>
</div>
<script>
const track = document.getElementById('track'); const slides = [...track.children];
for (const id of ['pano', 'grid']) { const el = document.getElementById(id); slides.forEach(s => el.appendChild(s.cloneNode(true))); }
const step = () => slides[0].getBoundingClientRect().width + 16;
document.getElementById('prev').onclick = () => track.scrollBy({ left: -step() });
document.getElementById('next').onclick = () => track.scrollBy({ left: step() });
track.addEventListener('scroll', () => { document.getElementById('count').textContent = \`\${Math.min(Math.round(track.scrollLeft / step()) + 1, slides.length)} / \${slides.length}\`; }, { passive: true });
</script>
`;
fs.writeFileSync(saida, html);
console.log(`${n} slides → ${saida}`);
