// Carrossel de CONTEÚDO, modelo editorial: papel claro × fundo escuro, fonte de título + texto + anotação manuscrita,
// moldura de app de notas, numeração 001. Cores, fontes, @ e avatar vêm do marca.json.
// uso: node gerar-conteudo.js <spec.json> [saida.html]   (padrão: ao lado do spec, mesmo nome)
// spec: { "titulo": "...", "palavra": "...", "persona": "...", "slides": [
//   { "tipo": "capa",    "kick": "linha pequena", "titulo": "Título com <it>destaque.</it>", "nota": "anotação à mão", "tam": 13, "tamIt": 15 },
//   { "tipo": "espelho", "lead": "Frase de identificação com <it>destaque.</it>", "ps": ["...", "<b>...</b>"], "promessa": "o que vem →", "tamLead": 9.6 },
//   { "tipo": "nota",    "fundo": "light|dark", "titulo": "1. ...", "ps": ["..."], "aside": "anotação ↗", "tam": 7.4 },
//   { "tipo": "virada",  "fundo": "light|dark", "d1": "...", "d2": "...", "p": "...", "tam1": 9, "tam2": 13 },
//   { "tipo": "cta",     "fundo": "light|dark", "titulo": "... <it>...</it>", "p": "...", "tarja": "...", "nota": "↓", "tam": 9 } ] }
// Marcação: <it>…</it> itálico na cor de acento · <b>…</b> negrito. A censura do marca.json é aplicada nas imagens.
const fs = require('fs');
const path = require('path');
const W = require('./ws');
const [, , specArq, saidaArg] = process.argv;
if (!specArq) { console.error('uso: node gerar-conteudo.js <spec.json> [saida.html]'); process.exit(1); }
const S = JSON.parse(fs.readFileSync(specArq, 'utf8'));
const M = W.marca(); const C = M.cores, F = M.fontes;
const saida = saidaArg || specArq.replace(/\.spec\.json$/i, '.html');

const md = s => W.censura(M, s || '').replace(/<it>/g, '<span class="it">').replace(/<\/it>/g, '</span>');
const seta = `<svg viewBox="0 0 60 60" fill="none" stroke="${C.acento}" stroke-width="2.6" stroke-linecap="round"><path d="M50 50C34 46 18 34 14 12"/><path d="M6 20l8-9 7 10"/></svg>`;
const av = '<i class="av"></i>';
const quem = `<span class="who">${av}@${W.esc(M.arroba)}</span>`;
const top = n => `<div class="top"><span>${W.esc(M.assinatura)}</span><span class="n">${String(n).padStart(3, '0')}</span></div>`;
const barra = `<div class="bar"><span class="back">‹ ${av}${W.esc(M.arroba)}</span><span class="tools"><i></i><i></i><i></i>Concluído</span></div>`;
const ps = arr => (arr || []).map(p => `<p class="p">${md(p)}</p>`).join('');

const slide = (s, i) => {
  const n = i + 1, f = s.fundo || 'light';
  switch (s.tipo) {
    case 'capa': return `<article class="slide light cover"><div class="in">${top(n)}
        <p class="kick">${md(s.kick)}</p>
        <h1 class="d" style="font-size:${s.tam || 13}cqw">${md(s.titulo).replace('<span class="it">', `<span class="it" style="font-size:${s.tamIt || 15}cqw">`)}</h1>
        ${s.nota ? `<p class="hand note">${seta}${md(s.nota)}</p>` : ''}
        <div class="foot">${quem}<span class="arrow">→</span></div></div></article>`;
    case 'espelho': return `<article class="slide dark mirror"><div class="in">${top(n)}
        <p class="d lead" style="font-size:${s.tamLead || 9.6}cqw">${md(s.lead)}</p>${ps(s.ps)}
        ${s.promessa ? `<p class="p accent" style="margin-top:7cqw">${md(s.promessa)}</p>` : ''}
        <div class="foot" style="margin-top:auto">${quem}<span></span></div></div></article>`;
    case 'nota': return `<article class="slide ${f} notes"><div class="in">${top(n)}${barra}
        <h3${s.tam ? ` style="font-size:${s.tam}cqw"` : ''}>${md(s.titulo)}</h3>${ps(s.ps)}
        ${s.aside ? `<p class="hand aside push">${md(s.aside)}</p>` : '<div class="push"></div>'}</div></article>`;
    case 'virada': return `<article class="slide ${f} turn"><div class="in">${top(n)}
        <p class="d d1" style="font-size:${s.tam1 || 9}cqw">${md(s.d1)}</p>
        <p class="d d2 it" style="font-size:${s.tam2 || 13}cqw">${md(s.d2)}</p>
        <hr class="rule"><p class="p">${md(s.p)}</p>
        <div class="foot" style="margin-top:auto">${quem}<span></span></div></div></article>`;
    case 'cta': return `<article class="slide ${f} cta"><div class="in">${top(n)}
        <p class="d" style="font-size:${s.tam || 9}cqw;margin:auto 0 5cqw">${md(s.titulo)}</p>
        ${s.p ? `<p class="p">${md(s.p)}</p>` : ''}
        ${s.tarja ? `<p class="quote"><span class="bar-hl">${md(s.tarja)}</span></p>` : ''}
        ${s.nota ? `<p class="hand ask">${md(s.nota)}</p>` : ''}
        <div class="foot">${quem}<span></span></div></div></article>`;
    default: throw new Error('tipo desconhecido: ' + s.tipo);
  }
};

const n = S.slides.length;
const html = `<title>${W.esc(S.titulo)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${W.linkFontes(M)}
<style>
/* Layout: prévia de carrossel 4:5 (1080×1350, medidas em cqw) — trilho deslizante + grade.
   Modelo editorial: papel claro × fundo escuro, um único acento, título serifado + texto + anotação manuscrita. */
:root {
  --bg: #f6f2f4; --fg: #1b1520; --muted: #6e6676; --line: #e6dde3; --chip: #ffffff;
  --display: "${F.titulo}", Georgia, serif; --body: "${F.texto}", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --hand: "${F.manuscrita}", "Segoe Print", cursive;
  --paper: ${C.claro}; --paper-ink: ${C.texto_escuro}; --plum: ${C.escuro}; --plum-ink: ${C.texto_claro}; --accent: ${C.acento}; --accent-l: ${C.acento_claro || C.acento};
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #121014; --fg: #f2edf3; --muted: #b0a7b6; --line: #2c2531; --chip: #1c1820; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #121014; --fg: #f2edf3; --muted: #b0a7b6; --line: #2c2531; --chip: #1c1820; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font-family: var(--body); }
.wrap { max-width: 1120px; margin: 0 auto; padding-block: 28px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 28px; }
header h1 { font-family: var(--display); font-weight: 400; font-size: clamp(28px, 4vw, 40px); margin: 0 0 6px; text-wrap: balance; }
header p { margin: 0; color: var(--muted); max-width: 65ch; line-height: 1.5; }
.meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.meta span { font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); background: var(--chip); padding: 5px 10px; border-radius: 999px; }
.viewer { display: grid; gap: 14px; }
.track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; scrollbar-width: thin; }
.track > .slide { flex: 0 0 min(440px, 86%); scroll-snap-align: start; }
.controls { display: flex; align-items: center; gap: 12px; }
.controls button { font: 600 14px var(--body); color: var(--fg); background: var(--chip); border: 1px solid var(--line); border-radius: 999px; padding: 9px 16px; cursor: pointer; }
.controls button:focus-visible, .track:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.controls .count { color: var(--muted); font-variant-numeric: tabular-nums; font-size: 14px; }
h2 { font-family: var(--display); font-weight: 400; font-size: 24px; margin: 8px 0 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; margin-top: 14px; }

.slide { aspect-ratio: 4 / 5; max-width: 100%; container-type: inline-size; position: relative; overflow: hidden; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.10); font-family: var(--body); }
.slide::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .10; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.light { background: var(--paper); color: var(--paper-ink); }
.dark { background: var(--plum); color: var(--plum-ink); }
.dark::before { mix-blend-mode: screen; opacity: .06; }
.in { position: absolute; inset: 0; padding: 7.5cqw 8cqw; display: flex; flex-direction: column; }
.top { display: flex; justify-content: space-between; align-items: center; font-size: 2.2cqw; font-weight: 600; letter-spacing: .32em; text-transform: uppercase; }
.top .n { letter-spacing: .12em; font-variant-numeric: tabular-nums; font-weight: 500; }
.foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-size: 2.6cqw; font-weight: 600; }
.foot .arrow { font-size: 5cqw; font-weight: 400; line-height: 1; }
.who { display: flex; align-items: center; gap: 2cqw; }
.av { display: inline-grid; place-items: center; width: 6.4cqw; height: 6.4cqw; border-radius: 50%; flex: none; font-style: normal;
  background: ${M.avatarData ? `var(--plum) url("${M.avatarData}") center/cover` : 'var(--accent)'}; color: #fff; font: 3.6cqw/1 var(--display); }
.av::after { content: "${M.avatarData ? '' : W.esc(M.inicial)}"; }
.notes .bar .av { width: 4.6cqw; height: 4.6cqw; font-size: 2.6cqw; }
.d { font-family: var(--display); font-weight: 400; letter-spacing: -.01em; margin: 0; text-wrap: balance; line-height: 1.02; }
.it { font-style: italic; color: var(--accent); }
.dark .it { color: var(--accent-l); }
.p { font-size: 4.5cqw; line-height: 1.4; margin: 0; letter-spacing: -.01em; }
.p + .p { margin-top: 4.2cqw; }
.p b { font-weight: 700; }
.accent { color: var(--accent); font-weight: 700; }
.dark .accent { color: var(--accent-l); }
.rule { width: 14cqw; height: .45cqw; background: var(--accent); margin: 6cqw 0; border: 0; }
.hand { font-family: var(--hand); font-weight: 600; color: var(--accent); line-height: 1.05; }
.dark .hand { color: var(--accent-l); }
.cover .kick { font-size: 5.4cqw; font-weight: 500; letter-spacing: -.02em; margin: auto 0 1.5cqw; }
.cover .kick b { font-weight: 800; }
.cover h1.d { line-height: .92; }
.cover h1.d .it { display: block; line-height: .95; margin-top: 1.5cqw; }
.cover .note { position: relative; margin: 5cqw 0 0 26cqw; font-size: 6.2cqw; transform: rotate(-4deg); max-width: 56cqw; }
.cover .note svg { position: absolute; left: -16cqw; top: -7cqw; width: 14cqw; height: 14cqw; }
.mirror .lead { margin: auto 0 7cqw; }
.notes .bar { display: flex; justify-content: space-between; align-items: center; font-size: 2.7cqw; font-weight: 600; margin-top: auto; }
.notes .bar .back { display: flex; align-items: center; gap: 1.4cqw; }
.notes .bar .tools { display: flex; align-items: center; gap: 3cqw; }
.notes .bar .tools i { width: 3.6cqw; height: 3.6cqw; border: .35cqw solid currentColor; border-radius: 50%; display: block; opacity: .75; }
.notes h3 { font-family: var(--body); font-weight: 700; font-size: 7.4cqw; line-height: 1.08; letter-spacing: -.03em; margin: 6cqw 0 5cqw; color: var(--accent); text-wrap: balance; }
.dark.notes h3 { color: var(--accent-l); }
.notes .aside { margin: 6cqw 0 0 auto; font-size: 6.2cqw; transform: rotate(-3deg); text-align: right; }
.notes .push { margin-bottom: auto; }
.turn .d1 { margin: auto 0 0; }
.turn .d2 { margin: 2cqw 0 0; line-height: .95; }
.bar-hl { display: inline; background: var(--accent); color: #fff; font-weight: 700; padding: .12em .4em; box-decoration-break: clone; -webkit-box-decoration-break: clone; line-height: 1.75; }
.cta .quote { font-family: var(--display); font-size: 6.2cqw; margin: 3cqw 0 0; }
.cta .ask { margin-top: 5cqw; font-size: 5.4cqw; transform: rotate(-3deg); }
@media (prefers-reduced-motion: no-preference) { .track { scroll-behavior: smooth; } }
</style>

<div class="wrap">
  <header>
    <h1>${W.esc(S.titulo)}</h1>
    <p>Prévia do carrossel de conteúdo de @${W.esc(M.arroba)} (${n} slides, 1080×1350). Deslize ou use os botões.</p>
    <div class="meta"><span>Modelo editorial</span>${S.persona ? `<span>Persona ${W.esc(S.persona)}</span>` : ''}${S.palavra ? `<span>Palavra-chave: ${W.esc(S.palavra)}</span>` : ''}</div>
  </header>
  <section class="viewer" aria-label="Carrossel">
    <div class="track" id="track" tabindex="0">
      ${S.slides.map(slide).join('\n      ')}
    </div>
    <div class="controls"><button type="button" id="prev">← Anterior</button><button type="button" id="next">Próximo →</button><span class="count" id="count">1 / ${n}</span></div>
  </section>
  <section><h2>Todos os slides</h2><div class="grid" id="grid"></div></section>
</div>
<script>
const track = document.getElementById('track'); const slides = [...track.children];
slides.forEach(s => document.getElementById('grid').appendChild(s.cloneNode(true)));
const step = () => slides[0].getBoundingClientRect().width + 16;
document.getElementById('prev').onclick = () => track.scrollBy({ left: -step() });
document.getElementById('next').onclick = () => track.scrollBy({ left: step() });
track.addEventListener('scroll', () => { document.getElementById('count').textContent = \`\${Math.min(Math.round(track.scrollLeft / step()) + 1, slides.length)} / \${slides.length}\`; }, { passive: true });
</script>
`;
fs.writeFileSync(saida, html);
console.log(`${n} slides → ${saida}`);
