---
name: conteudo-instagram
description: >
  Sistema completo de conteúdo para Instagram em qualquer nicho: cria a pasta "Conteudo Instagram"
  (referências de design, concorrentes, base de conhecimento, branding, pré-aprovado e aprovado),
  transforma 50–100 carrosséis de concorrentes em uma base de conhecimento do nicho (público, personas,
  ganchos, frameworks, tom, visual), monta a identidade visual a partir das referências e produz
  carrosséis de conteúdo, carrosséis de produto e posts estáticos de frase com prévia por link,
  exportação em PNG 1080×1350 + legenda e agendamento opcional. Use quando o usuário pedir para
  "criar conteúdo para o Instagram", "montar a estrutura de conteúdo", "analisar concorrentes",
  "criar base de conhecimento do nicho", "fazer carrossel", "carrossel de produto", "post estático",
  "frase para o Instagram", "exportar carrossel" ou "agendar posts".
---

# /conteudo-instagram

Do zero ao post agendado, para qualquer perfil e nicho. Tudo fica numa pasta **Conteudo Instagram**:

| Pasta | Quem preenche | O que tem |
|---|---|---|
| `1 - Referencia de Designer` | usuário | prints de carrosséis e posts para usar como modelo visual (`Carrossel conteudo/`, `Carrossel produto/`, `Post estatico/`) |
| `2 - Referencia de Concorrente` | usuário | 50–100 carrosséis do nicho, um por subpasta (`@perfil_codigo/img_01.jpg…`) |
| `3 - Base de Conhecimento` | skill | `TRANSCRICOES.md`, `BASE-CONHECIMENTO.md`, `DESIGN.md`, e opcionais (`palavras-chave.csv`, `produtos.csv`, `banco-frases.json`) |
| `4 - Diretriz de Branding` | usuário + skill | `marca.json` (nome, @, cores, fontes, tom, censura, regras) e `avatar.png` |
| `5 - Conteudo Pre Aprovado` | skill | ficha `.md` + roteiro `.spec.json` + prévia `.html` (+ `assets/` com recortes de produto) |
| `6 - Conteudo Aprovado` | skill, só após aprovação | `NN - Headline/` (PNGs + `legenda.txt`) e `Estaticos/` |

Scripts em `scripts/` (Node + Playwright; rode a partir de qualquer pasta dentro do projeto ou defina `CONTEUDO_IG`). Guias em `guia/`: `BIBLIOTECA.md` (ganchos G1–G19, frameworks F1–F16, CTAs, escrita, checklist), `MODELO-BASE.md`, `MODELO-FICHA.md`.

**Antes do primeiro uso:** `cd scripts && npm install` (Playwright 1.63 + IA de recorte; o Chromium do Playwright precisa estar instalado: `npx playwright install chromium`).

## Ordem de prioridade (não negociável)

1. **Base de conhecimento do nicho** (concorrentes) — fonte da verdade sobre público, gancho, estrutura e tom.
2. **Diretriz de branding** (`marca.json`) — cores, fontes, tom, palavras proibidas e regras da marca.
3. **Palavras-chave** (se houver) — decidem *quais palavras* vão na capa, legenda e texto alternativo.
4. **BIBLIOTECA.md** — padrões universais e regras de escrita (só polimento).

Nunca exporte nem agende sem aprovação explícita. Nunca invente estatística, depoimento, nome ou link.

---

## Fase 0 — Estrutura

Pergunte só onde criar (padrão: pasta atual) e rode `node scripts/iniciar.js "<onde>"`. Explique ao usuário o que colocar em cada pasta (os `LEIA-ME.md` já explicam) e o mínimo para seguir: **50+ carrosséis de concorrentes**, **referências de design** e **avatar.png**.

## Fase 1 — Base de conhecimento (depois que o usuário colocar os concorrentes)

1. **Transcrever:** no Windows, `powershell -ExecutionPolicy Bypass -File scripts/ocr.ps1 -Root "<2 - Referencia de Concorrente>" -Saida "<3 - Base de Conhecimento>/TRANSCRICOES.md" -Idioma pt-BR`. Em Mac/Linux, use `tesseract` se existir; senão, leia as imagens você mesmo (comece pelas capas).
2. **Ver o visual:** monte folhas de contato das capas (grade 6×4) e olhe; o OCR não mostra design.
3. **Ler todas as transcrições** (em partes) e escrever `BASE-CONHECIMENTO.md` seguindo `guia/MODELO-BASE.md`, com exemplos reais dos concorrentes, personas, banco de 30 ganchos e índice dos posts.
4. Se houver `palavras-chave.csv`, faça o mapa de palavras-chave (ver `MODELO-BASE.md`).
5. Publique a base como página (Artifact) se o usuário quiser compartilhar.

## Fase 2 — Branding e design

1. Olhe `1 - Referencia de Designer` (folhas de contato por modelo) e o que estiver em `4 - Diretriz de Branding`.
2. **Meça as cores** nas referências (leia o pixel) e **descubra as fontes**: `node scripts/comparar-fontes.js "<frase da referência>" teste.png "Fonte A" "Fonte B" …` e compare com o recorte da referência. Escolha a mais parecida no Google Fonts.
3. Preencha `marca.json`: `nome`, `arroba`, `assinatura`, `inicial`, `cores` (`claro`, `escuro`, `acento`, `acento_claro`, `texto_escuro`, `texto_claro`, `estatico_fundo`, `estatico_destaque`), `fontes` (`titulo`, `texto`, `manuscrita`, `produto_titulo`, `detalhe`, `estatico`), `google_fonts` (com os pesos), `tom`, `palavras_da_marca`, `palavras_proibidas`, `censura` (pares `["palavra","pala.vra"]` para palavras sensíveis do nicho) e `regras`.
4. Escreva `DESIGN.md` e mostre ao usuário uma prévia de teste de cada modelo antes de produzir em série.

**Modelos prontos** (se as referências pedirem outro layout, adapte o CSS do gerador e registre no `DESIGN.md`):
- **Editorial** (`gerar-conteudo.js`) — conteúdo: papel claro × escuro, título serifado, anotação manuscrita com seta, moldura de app de notas, numeração 001.
- **Panorama** (`gerar-produto.js`) — produto: fundo escuro, um slide claro de respiro, foto recortada atravessando a divisa entre slides, etiquetas e botão "Comente PALAVRA".
- **Estático** (`gerar-estatico.js`) — frase: fundo sólido (cor ou claro), frase centralizada, 1–2 palavras de destaque, avatar + @ no rodapé.

## Fase 3 — Carrossel de conteúdo

1. **Briefing** (decida sozinho; mostre em 5 linhas): tema, persona, objetivo (salvar / compartilhar / venda), framework, de qual carrossel da base vem a ideia.
2. **Palavra-chave** (se houver mapa): a de maior volume **com a mesma intenção do post**; 2–4 variações. Nunca escreva termo marcado como "não escrever assim".
3. **3 opções de capa** com ganchos diferentes; escolha e justifique.
4. **Slides** pelo framework (8–12; 5–7 para F6/F12/F14), seguindo a base e a `BIBLIOTECA.md`.
5. **Ficha** `5 - Conteudo Pre Aprovado/NN-slug.md` (formato em `guia/MODELO-FICHA.md`).
6. **Spec** `NN-slug.spec.json` (tipos `capa`, `espelho`, `nota`, `virada`, `cta` — formato no topo do script) → `node scripts/gerar-conteudo.js <spec>` → `.html`.
7. **Conferir:** `node scripts/exportar.js <html> teste <pasta-temporária>` e olhe as imagens (monte uma grade). Corrija texto que encosta no topo/rodapé (enxugue ou reduza `tam`) e repita uma vez.
8. **Publicar a prévia** (Artifact) e mandar o link. Esperar aprovação.

## Fase 4 — Carrossel de produto

1. Dados reais: `node scripts/produto.js "<nome>"` (lê `3 - Base de Conhecimento/produtos.csv`, exportação da Shopify; para outra plataforma, peça os dados ao usuário). Use só características que estão ali; corte promessas e alegações que o nicho proíbe.
2. Fotos: `node scripts/produto.js "<nome>" --fotos <pasta-temp>` → folha de contato → recorte 1–2 com `node scripts/recorte.js <foto> "<5 - Conteudo Pre Aprovado>/assets/<nome>-recorte-1.png"` (IA local; para fundo branco liso pode passar um número, ex. `245`) → confira sobre o fundo escuro da marca. Produto da mesma cor do fundo some: prefira outra variante.
3. Estrutura (8–10): capa → problema com o produto **entrando** → "Conheça o X" + 4 etiquetas com o produto **saindo** → slide claro com o benefício central → benefícios → produto **centralizado na divisa** → "Primeira vez? 3 passos." → CTA "Comente PALAVRA".
4. Ficha + `spec.json` (formato no topo de `gerar-produto.js`) → `node scripts/gerar-produto.js <spec>` → conferir panorama (o produto não pode cobrir texto; destaque na cor do produto some) → publicar → aprovação.

## Fase 5 — Post estático de frase

1. Frases: do usuário, da base, ou de um `banco-frases.json` em `3 - Base de Conhecimento` (`[{ "id": "001", "frase": "...", "autor": "...", "curadoria": "recomendada|evitar (...)", "usada_em": "" }]`). Nunca use letra de música nem frase marcada "evitar"; dê crédito ao autor na legenda.
2. Lote `5 - Conteudo Pre Aprovado/estaticos-NN.json` (`texto` ou `id`, `destaque`, `fundo` cor/claro, `cta`, `hashtags`) → `node scripts/gerar-estatico.js <lote>` → conferir (`exportar-estatico.js <html> <pasta-temp>`) → publicar → aprovação.

## Fase 6 — Exportar (só depois da aprovação)

- Carrossel: `node scripts/exportar.js "<.html>" "<headline da capa sem censura>"` → `6 - Conteudo Aprovado/NN - Headline/` com PNGs 1080×1350 + `legenda.txt` (seção "### Legenda" da ficha).
- Estáticos: `node scripts/exportar-estatico.js "<.html>"` → `6 - Conteudo Aprovado/Estaticos/E### - frase.png` + `.txt`; marca `usada_em` no banco de frases.
- Confira uma imagem exportada antes de avisar.

## Fase 7 — Agendar (opcional, só quando pedido)

Com a MCP do SpartaGram instalada (`claude mcp add --transport http --scope user spartagram https://social.spartamidia.com/mcp --header "Authorization: Bearer <token>"`):
- Veja os pendentes (`listar_agendamentos`) para não repetir post nem bater horário.
- Confirme conta, datas/horários e legendas com o usuário (a MCP exige).
- `node scripts/agendar.js "<NN - >" "AAAA-MM-DD HH:MM" "<E004>" "AAAA-MM-DD HH:MM" …` (sobe as imagens na ordem e agenda com a legenda, sem automação). Automação de palavra-chave → direct só se o usuário pedir e informar o link real.

## Erros comuns (aprendidos na prática)

- Texto demais no slide → encosta no @ ou na seta: enxugue antes de diminuir a fonte.
- Palavra de destaque na mesma cor do produto da foto → some; mude a cor ou afaste a foto.
- Ao montar HTML por substituição de texto, nunca use regex sobre `{{marcadores}}` (as chaves quebram o CSS); prefira os geradores.
- Imagens grandes embutidas em CSS: sempre `url("data:…")` com aspas.
- O scratchpad/pasta temporária pode sumir: nada definitivo fora de `Conteudo Instagram`.
