// Base comum dos scripts: acha a pasta "Conteudo Instagram", carrega a marca e oferece utilidades.
const fs = require('fs');
const path = require('path');

const PASTAS = {
  design: '1 - Referencia de Designer',
  concorrentes: '2 - Referencia de Concorrente',
  base: '3 - Base de Conhecimento',
  marca: '4 - Diretriz de Branding',
  pre: '5 - Conteudo Pre Aprovado',
  aprovado: '6 - Conteudo Aprovado',
};

// Raiz do projeto: variável CONTEUDO_IG, ou a pasta atual/acima que tenha "4 - Diretriz de Branding",
// ou uma subpasta "Conteudo Instagram" dela.
function raiz() {
  if (process.env.CONTEUDO_IG) return path.resolve(process.env.CONTEUDO_IG);
  let d = process.cwd();
  for (;;) {
    if (fs.existsSync(path.join(d, PASTAS.marca))) return d;
    const c = path.join(d, 'Conteudo Instagram');
    if (fs.existsSync(path.join(c, PASTAS.marca))) return c;
    const pai = path.dirname(d); if (pai === d) break; d = pai;
  }
  throw new Error('Pasta "Conteudo Instagram" não encontrada. Rode scripts/iniciar.js ou defina a variável CONTEUDO_IG.');
}
const pasta = (chave, ...resto) => path.join(raiz(), PASTAS[chave], ...resto);

function marca() {
  const arq = pasta('marca', 'marca.json');
  if (!fs.existsSync(arq)) throw new Error('Falta ' + arq + ' (preencha a Diretriz de Branding).');
  const m = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const av = pasta('marca', m.avatar || 'avatar.png');
  m.avatarData = fs.existsSync(av) ? `data:image/${av.endsWith('.jpg') || av.endsWith('.jpeg') ? 'jpeg' : 'png'};base64,` + fs.readFileSync(av).toString('base64') : null;
  m.inicial = m.inicial || (m.nome || '?')[0].toUpperCase();
  m.assinatura = m.assinatura || (m.nome || '').toUpperCase();
  return m;
}

// Link do Google Fonts a partir de marca.google_fonts (ex.: ["Inter:wght@400;600;700", "DM+Serif+Display:ital@0;1"])
const linkFontes = m => (m.google_fonts || []).length
  ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${m.google_fonts.map(f => 'family=' + f).join('&')}&display=swap">` : '';

// Censura leve das palavras sensíveis do nicho (marca.censura = [["sexo","se.xo"], ...]); mantém a maiúscula inicial.
function censura(m, s) {
  return (m.censura || []).reduce((t, [de, para]) => t.replace(new RegExp(`(?<![\\p{L}])${de}(?![\\p{L}])`, 'giu'),
    x => x[0] === x[0].toUpperCase() ? para[0].toUpperCase() + para.slice(1) : para), s || '');
}

// Próximo número livre (NN) entre arquivos/pastas que começam com dígitos
function proximo(dir, casas = 2) {
  if (!fs.existsSync(dir)) return '1'.padStart(casas, '0');
  const nums = fs.readdirSync(dir).map(n => parseInt(n.replace(/^\D+/, ''), 10)).filter(Number.isFinite);
  return String((nums.length ? Math.max(...nums) : 0) + 1).padStart(casas, '0');
}
const nomeSeguro = s => s.replace(/[\\/:*?"<>|\n]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80).replace(/[. ]+$/, '');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

module.exports = { PASTAS, raiz, pasta, marca, linkFontes, censura, proximo, nomeSeguro, esc };
