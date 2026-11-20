// Agenda no Instagram pelo SpartaGram (MCP social.spartamidia.com), sem automação.
// uso: node agendar.js "<carrossel ou estático>" "AAAA-MM-DD HH:MM" [ ... pares ... ]
//   carrossel = pasta (ou início do nome, ex.: "09 - ") em "6 - Conteudo Aprovado" → envia 01.png, 02.png... + legenda.txt
//   estático  = arquivo .png em "6 - Conteudo Aprovado/Estaticos" (ou início do nome, ex.: "E004") → legenda no .txt de mesmo nome
// Conta = @ do marca.json. Token = cabeçalho da MCP "spartagram" em ~/.claude.json
//   (instalar: claude mcp add --transport http --scope user spartagram https://social.spartamidia.com/mcp --header "Authorization: Bearer <token>")
const fs = require('fs');
const path = require('path');
const os = require('os');
const W = require('./ws');
const URL_MCP = 'https://social.spartamidia.com/mcp';
const args = process.argv.slice(2);
if (!args.length || args.length % 2) { console.error('uso: node agendar.js "<pasta|png>" "AAAA-MM-DD HH:MM" [...]'); process.exit(1); }
const auth = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude.json'), 'utf8')).mcpServers?.spartagram?.headers?.Authorization;
if (!auth) { console.error('MCP "spartagram" não está instalada (veja o comando no topo deste arquivo).'); process.exit(1); }
const M = W.marca();

let rid = 0;
async function chamar(name, a = {}) {
  const r = await fetch(URL_MCP, { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rid, method: 'tools/call', params: { name, arguments: a } }) });
  const j = await r.json(); if (j.error) throw new Error(`${name}: ${JSON.stringify(j.error)}`);
  const t = j.result.content.map(c => c.text).join(''); if (j.result.isError) throw new Error(`${name}: ${t}`);
  try { return JSON.parse(t); } catch { return t; }
}
function achar(alvo) {
  if (fs.existsSync(alvo)) return alvo;
  const ap = W.pasta('aprovado'), est = W.pasta('aprovado', 'Estaticos');
  const d = fs.readdirSync(ap).find(n => n.startsWith(alvo)); if (d) return path.join(ap, d);
  const e = fs.existsSync(est) && fs.readdirSync(est).find(n => n.startsWith(alvo) && n.endsWith('.png')); if (e) return path.join(est, e);
  throw new Error('não encontrei: ' + alvo);
}

(async () => {
  const contas = await chamar('listar_contas');
  const conta = contas.contas.find(c => c.usuario.replace('@', '') === M.arroba.replace('@', '') && c.status === 'active');
  if (!conta) throw new Error(`conta @${M.arroba} não está conectada/ativa no SpartaGram`);
  for (let i = 0; i < args.length; i += 2) {
    const alvo = achar(args[i]), quando = args[i + 1];
    const estatico = alvo.endsWith('.png');
    const fotos = estatico ? [alvo] : fs.readdirSync(alvo).filter(f => /^\d+\.png$/.test(f)).sort().map(f => path.join(alvo, f));
    const legenda = fs.readFileSync(estatico ? alvo.replace(/\.png$/, '.txt') : path.join(alvo, 'legenda.txt'), 'utf8').trim();
    if (!estatico && (fotos.length < 2 || fotos.length > 20)) throw new Error(`${alvo}: carrossel precisa de 2 a 20 fotos`);
    const envio = await chamar('preparar_envio');
    const arquivos = [];
    for (const f of fotos) {
      const fd = new FormData(); fd.append('arquivo', new Blob([fs.readFileSync(f)], { type: 'image/png' }), path.basename(f));
      const up = await (await fetch(envio.url_envio, { method: 'POST', body: fd })).json();
      if (!up.arquivo_id) throw new Error(`envio de ${f} falhou: ${JSON.stringify(up)}`);
      arquivos.push(up.arquivo_id);
    }
    const r = await chamar('agendar_publicacao', { tipo: estatico ? 'estatico' : 'carrossel', arquivos, data_hora: quando, legenda, conta_id: conta.conta_id, formato: '4:5' });
    console.log(`${path.basename(alvo)} → ${r.agendado.data_hora} (${r.agendado.tipo}, id ${r.agendado.agendamento_id})${r.avisos?.length ? ' AVISOS: ' + r.avisos.join('; ') : ''}`);
  }
})().catch(e => { console.error(e.message || e); process.exit(1); });
