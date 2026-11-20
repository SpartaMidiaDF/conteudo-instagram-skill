// Cria a estrutura "Conteudo Instagram" com as 6 pastas, instruções (LEIA-ME) e o marca.json para preencher.
// uso: node iniciar.js [pasta-onde-criar]   (padrão: pasta atual)
const fs = require('fs');
const path = require('path');
const { PASTAS } = require('./ws');
const onde = path.resolve(process.argv[2] || process.cwd());
const R = path.join(onde, 'Conteudo Instagram');

const leia = {
  design: `# Referência de Designer

Coloque aqui prints de carrosséis e posts que você quer usar como **modelo visual** (não precisam ser do seu nicho).
Separe em subpastas:

- \`Carrossel conteudo/\` — carrosséis educativos/de texto (uma subpasta por carrossel, com as imagens em ordem: 1.jpg, 2.jpg...)
- \`Carrossel produto/\` — carrosséis que apresentam produto
- \`Post estatico/\` — posts de imagem única (frases, avisos)

Quanto mais claro o padrão (fundo, fontes, cores, onde fica o @), mais fiel fica o design.`,
  concorrentes: `# Referência de Concorrente

Coloque aqui **50 a 100 carrosséis** de perfis do seu nicho que engajam bem.
**Uma subpasta por post**, com o nome \`@perfil_codigo-do-post\` (ex.: \`@fulana_DJcQ-RIxxpp\`), e dentro as imagens na ordem (img_01.jpg, img_02.jpg...).

Dica: ferramentas de download de carrossel do Instagram já salvam nesse formato. Vídeos dentro do carrossel podem ficar junto.`,
  base: `# Base de Conhecimento

Esta pasta é preenchida pela skill:

- \`TRANSCRICOES.md\` — o texto de todos os carrosséis dos concorrentes (OCR)
- \`BASE-CONHECIMENTO.md\` — público, personas, dores, ganchos, frameworks, tom, visual, regras e banco de ganchos do nicho
- \`DESIGN.md\` — o sistema visual tirado das suas referências de designer

Opcional (coloque aqui se tiver):
- \`palavras-chave.csv\` — exportação de consultas do Google Search Console (aba "Consultas")
- \`produtos.csv\` — exportação de produtos da Shopify (para carrosséis de produto)
- \`banco-frases.json\` — frases para posts estáticos`,
  marca: `# Diretriz de Branding

Coloque aqui:
- \`avatar.png\` — a foto do perfil do Instagram (quadrada)
- logo, manual da marca, paleta ou qualquer referência de identidade (opcional)

E preencha \`marca.json\` (a skill ajuda a preencher a partir das referências):
- nome, @ do Instagram, nicho, público
- cores (fundo claro, fundo escuro, acento, textos) e fontes (Google Fonts)
- tom de voz, palavras que a marca usa e palavras proibidas
- censura: palavras sensíveis do nicho que devem sair "quebradas" nas imagens (ex.: ["sexo","se.xo"])
- regras do nicho (ex.: nada de promessa de cura, sem antes/depois)`,
  pre: `# Conteúdo Pré-Aprovado

A skill salva aqui cada peça para você revisar antes de aprovar:
- \`NN-slug.md\` — a ficha (copy de cada slide, legenda, texto alternativo, observações)
- \`NN-slug.spec.json\` — o roteiro técnico do design
- \`NN-slug.html\` — a prévia visual (também publicada num link)

Nada daqui vai para o Instagram sem a sua aprovação.`,
  aprovado: `# Conteúdo Aprovado

Só entra aqui o que você aprovou:
- \`NN - Headline/\` — carrossel exportado (01.png, 02.png... em 1080×1350) + \`legenda.txt\`
- \`Estaticos/\` — posts estáticos (\`E001 - frase.png\` + \`.txt\` com a legenda)

Daqui a skill pode agendar direto no Instagram (SpartaGram), se você pedir.`,
};

const marcaModelo = {
  nome: 'Minha Marca',
  arroba: 'minhamarca',
  nicho: 'descreva o nicho em uma linha',
  publico: 'quem a marca quer atrair',
  avatar: 'avatar.png',
  assinatura: 'MINHA MARCA',
  cores: { claro: '#f8f4f1', escuro: '#1c1424', acento: '#e0457b', acento_claro: '#f06a96', texto_escuro: '#1c1424', texto_claro: '#f6eef3', estatico_fundo: '#e0457b', estatico_destaque: '#1c1424' },
  fontes: { titulo: 'DM Serif Display', texto: 'Inter', manuscrita: 'Caveat', produto_titulo: 'Open Sans', detalhe: 'Quicksand', estatico: 'Gilda Display' },
  google_fonts: ['DM+Serif+Display:ital@0;1', 'Inter:wght@400;500;600;700;800', 'Caveat:wght@500;700', 'Open+Sans:ital,wght@0,400;0,700;0,800;1,400;1,700', 'Quicksand:wght@400;500;600', 'Gilda+Display'],
  tom: 'ex.: amiga que entende do assunto, acolhedora, humor leve',
  palavras_da_marca: [],
  palavras_proibidas: [],
  censura: [],
  regras: ['Nunca inventar estatística, depoimento ou nome', 'Sem promessa de resultado de saúde'],
};

fs.mkdirSync(R, { recursive: true });
for (const [k, nome] of Object.entries(PASTAS)) {
  const d = path.join(R, nome); fs.mkdirSync(d, { recursive: true });
  const lm = path.join(d, 'LEIA-ME.md'); if (!fs.existsSync(lm)) fs.writeFileSync(lm, leia[k] + '\n');
}
for (const s of ['Carrossel conteudo', 'Carrossel produto', 'Post estatico']) fs.mkdirSync(path.join(R, PASTAS.design, s), { recursive: true });
fs.mkdirSync(path.join(R, PASTAS.pre, 'assets'), { recursive: true });
fs.mkdirSync(path.join(R, PASTAS.aprovado, 'Estaticos'), { recursive: true });
const mj = path.join(R, PASTAS.marca, 'marca.json');
if (!fs.existsSync(mj)) fs.writeFileSync(mj, JSON.stringify(marcaModelo, null, 2) + '\n');
console.log('Estrutura pronta em ' + R);
for (const nome of Object.values(PASTAS)) console.log('  ' + nome);
