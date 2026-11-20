// Posts ESTÁTICOS de frase (1080×1350): fundo sólido (cor da marca ou claro), frase centralizada na fonte "estatico",
// 1–2 palavras de destaque na cor escura, avatar + @ no rodapé. A frase se ajusta sozinha ao espaço.
// uso: node gerar-estatico.js <lote.json> [saida.html]
// lote.json: [ { "texto": "Quero você por inteiro, não pela metade.", "autor": "Autor desconhecido", "destaque": ["inteiro"],
//               "fundo": "cor" | "claro", "cta": "Marca quem...", "hashtags": "#a #b" },
//             { "id": "138", ... }   ← opcional: pega texto/autor de "3 - Base de Conhecimento/banco-frases.json" ]
const fs = require('fs');
const W = require('./ws');
const [, , loteArq, saidaArg] = process.argv;
if (!loteArq) { console.error('uso: node gerar-estatico.js <lote.json> [saida.html]'); process.exit(1); }
const M = W.marca(); const C = M.cores, F = M.fontes;
const lote = JSON.parse(fs.readFileSync(loteArq, 'utf8'));
const saida = saidaArg || loteArq.replace(/\.json$/i, '.html');
const bancoArq = W.pasta('base', 'banco-frases.json');
const banco = fs.existsSync(bancoArq) ? JSON.parse(fs.readFileSync(bancoArq, 'utf8')) : [];
const credito = a => !a ? '' : /desconhecido/i.test(a) ? 'Autor desconhecido' : a;
const nomeArq = s => W.nomeSeguro(s.split(' ').slice(0, 7).join(' ')).replace(/[.,;!?…]+$/, '');

const posts = lote.map(l => {
  const b = l.id ? banco.find(x => x.id === String(l.id).padStart(3, '0')) : null;
  if (l.id && !b) throw new Error('frase não encontrada no banco: ' + l.id);
  if (b?.curadoria?.startsWith('evitar')) throw new Error(`frase ${b.id} marcada para evitar: ${b.curadoria}`);
  const texto = (l.texto || b.frase).replace(/\n/g, ' ').replace(/\p{Extended_Pictographic}|‍|️/gu, '').trim();
  const autor = l.autor ?? b?.autor;
  let html = W.esc(W.censura(M, texto));
  for (const d of l.destaque || []) { const dd = W.esc(W.censura(M, d)); if (!html.includes(dd)) throw new Error(`destaque "${d}" não está em: ${texto}`); html = html.replace(dd, `<b>${dd}</b>`); }
  const legenda = l.legenda || [`“${texto}”${credito(autor) ? `\n— ${credito(autor)}` : ''}`, l.cta || 'Salva e manda para quem precisa ler isso hoje', l.hashtags || ''].filter(Boolean).join('\n\n');
  return { fundo: l.fundo === 'claro' ? 'claro' : 'cor', html, legenda, nome: (b ? `F${b.id} ` : '') + nomeArq(texto) };
});

const page = `<title>Posts estáticos ${W.esc(M.nome)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${W.linkFontes(M)}
<style>
/* Layout: grade de posts estáticos 4:5 (1080×1350, cqw) com o nome do arquivo e a legenda de cada um.
   Fundo sólido da marca ou claro, frase centralizada e apertada, destaque na cor escura, avatar + @ no rodapé. */
:root { --bg: #f6f2f4; --fg: #1b1520; --muted: #6e6676; --line: #e6dde3;
  --cor: ${C.estatico_fundo || C.acento}; --escuro: ${C.estatico_destaque || C.escuro}; --escuro-claro: ${C.texto_escuro || C.escuro}; --claro: #ffffff;
  --serif: "${F.estatico || F.titulo}", Georgia, serif; --soft: "${F.detalhe || F.texto}", system-ui, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #121014; --fg: #f2edf3; --muted: #b0a7b6; --line: #2c2531; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #121014; --fg: #f2edf3; --muted: #b0a7b6; --line: #2c2531; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.wrap { max-width: 1120px; margin: 0 auto; padding-block: 28px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 24px; }
header h1 { font-family: var(--serif); font-weight: 400; font-size: clamp(28px, 4vw, 40px); margin: 0 0 6px; }
header p { margin: 0; color: var(--muted); max-width: 65ch; line-height: 1.5; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 22px; }
figure { margin: 0; display: grid; gap: 10px; min-width: 0; }
figcaption { font-size: 13px; color: var(--muted); line-height: 1.45; white-space: pre-line; border-left: 2px solid var(--line); padding-left: 10px; }
figcaption strong { color: var(--fg); display: block; margin-bottom: 4px; }
.slide { aspect-ratio: 4 / 5; max-width: 100%; container-type: inline-size; position: relative; overflow: hidden; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.10); }
.cor { background: var(--cor); color: #fff; }
.claro { background: var(--claro); color: var(--cor); box-shadow: 0 0 0 1px var(--line), 0 8px 24px rgba(0,0,0,.08); }
.frase { position: absolute; left: 50%; top: 49%; transform: translate(-50%, -50%); width: 70cqw; margin: 0; text-align: center; text-wrap: balance;
  font-family: var(--serif); font-weight: 400; font-size: 13.2cqw; line-height: .8; letter-spacing: -.035em; }
.frase b { font-weight: 400; color: var(--escuro); -webkit-text-stroke: .018em var(--escuro); letter-spacing: -.025em; }
.who { position: absolute; left: 0; right: 0; bottom: 9.5cqw; display: flex; justify-content: center; align-items: center; gap: 2.6cqw; font: 600 2.7cqw var(--soft); color: var(--escuro); }
.claro .who { font-weight: 500; color: var(--escuro-claro); }
.claro .frase b { color: var(--escuro-claro); -webkit-text-stroke-color: var(--escuro-claro); }
.av { width: 7.6cqw; height: 7.6cqw; border-radius: 50%; flex: none; display: grid; place-items: center; color: #fff; font: 4cqw/1 var(--serif);
  background: ${M.avatarData ? `${C.escuro} url("${M.avatarData}") center/cover` : C.escuro}; }
.av::after { content: "${M.avatarData ? '' : W.esc(M.inicial)}"; }
.claro .av { box-shadow: 0 0 0 .3cqw var(--cor); }
</style>

<div class="wrap">
  <header><h1>Posts estáticos</h1><p>${posts.length} posts de @${W.esc(M.arroba)} (1080×1350). Abaixo de cada um: nome do arquivo e legenda pronta.</p></header>
  <div class="grid">${posts.map(p => `
    <figure>
      <article class="slide ${p.fundo}" data-nome="${W.esc(p.nome)}" data-legenda="${W.esc(p.legenda)}">
        <p class="frase">${p.html}</p>
        <div class="who"><i class="av"></i><span>@${W.esc(M.arroba)}</span></div>
      </article>
      <figcaption><strong>${W.esc(p.nome)}.png</strong>${W.esc(p.legenda)}</figcaption>
    </figure>`).join('')}
  </div>
</div>
<script>
async function encaixar() {
  await document.fonts.ready;
  for (const s of document.querySelectorAll('.slide')) {
    const f = s.querySelector('.frase'); let fs = 13.2; f.style.fontSize = fs + 'cqw';
    while (fs > 6 && f.getBoundingClientRect().height > s.clientHeight * .5) { fs -= .25; f.style.fontSize = fs + 'cqw'; }
  }
  document.documentElement.dataset.pronto = '1';
}
encaixar(); addEventListener('resize', encaixar);
</script>
`;
fs.writeFileSync(saida, page);
console.log(posts.length, 'posts →', saida);
