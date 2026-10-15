// Gera docs/arquitetura/PedeJa-Arquitetura-arc42.pdf:
//   1. renderiza diagramas/*.puml em SVG (PlantUML + C4-PlantUML embutido);
//   2. preenche arc42.html (grupo, diagramas numerados, sumário, árvore do código
//      e lista dos testes de arquitetura lidos do repositório);
//   3. imprime em PDF com o Edge/Chrome instalado (puppeteer-core).
// Requisitos: Java 11+ e Microsoft Edge ou Google Chrome.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(DIR, '../..');
const GERADO = path.join(DIR, 'gerado');
const PLANTUML_URL = 'https://github.com/plantuml/plantuml/releases/download/v1.2025.4/plantuml-1.2025.4.jar';
const PLANTUML_JAR = path.join(DIR, '.tools', 'plantuml.jar');
const SAIDA_PDF = path.join(DIR, 'PedeJa-Arquitetura-arc42.pdf');

async function garantirPlantUml() {
  if (fs.existsSync(PLANTUML_JAR)) return;
  console.log('Baixando PlantUML...');
  fs.mkdirSync(path.dirname(PLANTUML_JAR), { recursive: true });
  const resposta = await fetch(PLANTUML_URL);
  if (!resposta.ok) throw new Error(`Falha ao baixar PlantUML: ${resposta.status}`);
  fs.writeFileSync(PLANTUML_JAR, Buffer.from(await resposta.arrayBuffer()));
}

function renderizarDiagramas() {
  fs.mkdirSync(GERADO, { recursive: true });
  const fontes = fs.readdirSync(path.join(DIR, 'diagramas')).filter((f) => f.endsWith('.puml'));
  console.log(`Renderizando ${fontes.length} diagramas...`);
  execFileSync('java', ['-jar', PLANTUML_JAR, '-tsvg', '-failfast2', '-o', GERADO, ...fontes.map((f) => path.join(DIR, 'diagramas', f))], {
    stdio: ['ignore', 'inherit', 'pipe'],
  });
  return new Set(fontes.map((f) => f.replace(/\.puml$/, '')));
}

function arvore(dir, prefixo = '') {
  const itens = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
  return itens.flatMap((item, i) => {
    const ultimo = i === itens.length - 1;
    const linha = `${prefixo}${ultimo ? '└── ' : '├── '}${item.name}${item.isDirectory() ? '/' : ''}`;
    return item.isDirectory() ? [linha, ...arvore(path.join(dir, item.name), prefixo + (ultimo ? '    ' : '│   '))] : [linha];
  });
}

function testesDeArquitetura() {
  const dir = path.join(RAIZ, 'backend/tests/arquitetura');
  const linhas = [];
  for (const arquivo of fs.readdirSync(dir).filter((f) => f.endsWith('.test.ts')).sort()) {
    let grupo = '';
    for (const linha of fs.readFileSync(path.join(dir, arquivo), 'utf8').split('\n')) {
      const d = /describe\('([^']+)'/.exec(linha);
      if (d) grupo = d[1];
      const t = /\bit\('([^']+)'/.exec(linha);
      if (t) linhas.push(`<tr><td><code>${arquivo}</code></td><td>${grupo}</td><td>${t[1]}</td></tr>`);
    }
  }
  return `<table><thead><tr><th>Arquivo</th><th>Grupo</th><th>Regra verificada</th></tr></thead><tbody>${linhas.join('')}</tbody></table>`;
}

function montarHtml(diagramasDisponiveis) {
  const grupo = JSON.parse(fs.readFileSync(path.join(DIR, 'grupo.json'), 'utf8'));
  const pendentes = grupo.integrantes.filter((n) => n.startsWith('[PREENCHER'));
  let html = fs.readFileSync(path.join(DIR, 'arc42.html'), 'utf8');

  let numero = 0;
  html = html.replace(/\{\{diagrama ([\w-]+) (\d+)( paisagem)? \| ([^}]+)\}\}/g, (_m, nome, largura, paisagem, legenda) => {
    if (!diagramasDisponiveis.has(nome)) throw new Error(`Diagrama inexistente: ${nome}`);
    numero += 1;
    const figura = `<figure><img src="${nome}.svg" style="width:${largura}%" alt="${legenda.trim()}" /><figcaption>Figura ${numero} — ${legenda.trim()}</figcaption></figure>`;
    return paisagem ? `<div class="paisagem">${figura}</div>` : figura;
  });

  const integrantes = grupo.integrantes
    .map((n) => `<li${n.startsWith('[PREENCHER') ? ' class="pendente"' : ''}>${n}</li>`)
    .join('');
  const instProf = [grupo.instituicao, grupo.professor && `Professor(a): ${grupo.professor}`].filter(Boolean).join(' · ');
  const data = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  html = html
    .replace('{{disciplina}}', grupo.disciplina)
    .replace('{{atividade}}', grupo.atividade)
    .replace('{{integrantes}}', `<ol>${integrantes}</ol>`)
    .replace('{{instituicao-professor}}', instProf ? `${instProf} · ` : '')
    .replace('{{data}}', data)
    .replace('{{arvore-codigo}}', `<pre class="arvore">backend/src/\n${arvore(path.join(RAIZ, 'backend/src')).join('\n')}</pre>`)
    .replace('{{testes-arquitetura}}', testesDeArquitetura());

  // Sumário a partir dos títulos h2/h3 (ids gerados para os h3)
  const itens = [];
  let contador = 0;
  html = html.replace(/<h([23])( id="([^"]+)")?>([^<]+)<\/h[23]>/g, (m, nivel, _attr, id, texto) => {
    const ident = id ?? `t${++contador}`;
    itens.push({ nivel: Number(nivel), id: ident, texto });
    return `<h${nivel} id="${ident}">${texto}</h${nivel}>`;
  });
  let sumario = '<ol>';
  itens.forEach((item, i) => {
    sumario += `<li><a href="#${item.id}">${item.texto}</a>`;
    const proximo = itens[i + 1];
    if (proximo?.nivel === 3 && item.nivel === 2) sumario += '<ol>';
    else sumario += '</li>';
    if (item.nivel === 3 && proximo?.nivel !== 3) sumario += '</ol></li>';
  });
  html = html.replace('{{sumario}}', `${sumario}</ol>`);

  if (/\{\{[^}]+\}\}/.test(html)) throw new Error(`Marcador não substituído: ${/\{\{[^}]+\}\}/.exec(html)[0]}`);
  fs.copyFileSync(path.join(DIR, 'estilo.css'), path.join(GERADO, 'estilo.css'));
  const destino = path.join(GERADO, 'arc42.html');
  fs.writeFileSync(destino, html);
  return { destino, pendentes, figuras: numero };
}

function localizarNavegador() {
  const candidatos = [
    process.env.NAVEGADOR,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  const encontrado = candidatos.find((c) => fs.existsSync(c));
  if (!encontrado) throw new Error('Edge/Chrome não encontrado. Defina a variável NAVEGADOR com o caminho do executável.');
  return encontrado;
}

async function gerarPdf(arquivoHtml) {
  const navegador = await puppeteer.launch({ executablePath: localizarNavegador(), headless: true });
  try {
    const pagina = await navegador.newPage();
    await pagina.goto(pathToFileURL(arquivoHtml).href, { waitUntil: 'networkidle0' });
    await pagina.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
    await pagina.pdf({
      path: SAIDA_PDF,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#666;padding:0 16mm;display:flex;justify-content:space-between;font-family:Segoe UI,Arial">' +
        '<span>PedeJá — Documentação de Arquitetura (arc42)</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
    });
  } finally {
    await navegador.close();
  }
}

await garantirPlantUml();
const diagramas = renderizarDiagramas();
const { destino, pendentes, figuras } = montarHtml(diagramas);
await gerarPdf(destino);
console.log(`PDF gerado: ${SAIDA_PDF} (${figuras} figuras)`);
if (pendentes.length) console.warn(`ATENÇÃO: preencha os nomes dos integrantes em grupo.json (${pendentes.length} pendente(s)).`);
