import fs from 'fs';
import path from 'path';
import ts from 'typescript';

// Monta o grafo de dependências de src/ lendo os imports de cada arquivo com o
// próprio compilador do TypeScript. Base para os testes de arquitetura.

export const RAIZ_SRC = path.resolve(__dirname, '../../src');

export interface Modulo {
  /** Caminho relativo a src/, com "/" (ex.: services/pedidos/domain/pedido.ts) */
  arquivo: string;
  /** Imports internos resolvidos (relativos a src/) */
  internos: string[];
  /** Pacotes externos importados (ex.: express, crypto) */
  externos: string[];
}

function listarArquivos(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const caminho = path.join(dir, e.name);
    if (e.isDirectory()) return listarArquivos(caminho);
    return e.name.endsWith('.ts') ? [caminho] : [];
  });
}

function relativo(absoluto: string): string {
  return path.relative(RAIZ_SRC, absoluto).split(path.sep).join('/');
}

function resolver(origem: string, especificador: string): string {
  const base = path.resolve(path.dirname(origem), especificador);
  for (const candidato of [`${base}.ts`, path.join(base, 'index.ts'), base]) {
    if (fs.existsSync(candidato) && fs.statSync(candidato).isFile()) return relativo(candidato);
  }
  throw new Error(`Import não resolvido: "${especificador}" em ${relativo(origem)}`);
}

let cache: Modulo[] | undefined;

export function carregarModulos(): Modulo[] {
  if (cache) return cache;
  cache = listarArquivos(RAIZ_SRC).map((absoluto) => {
    const { importedFiles } = ts.preProcessFile(fs.readFileSync(absoluto, 'utf8'), true, false);
    const especificadores = importedFiles.map((f) => f.fileName);
    return {
      arquivo: relativo(absoluto),
      internos: especificadores.filter((s) => s.startsWith('.')).map((s) => resolver(absoluto, s)),
      externos: especificadores.filter((s) => !s.startsWith('.')).map((s) => s.replace(/^node:/, '')),
    };
  });
  return cache;
}

export function modulos(filtro: (arquivo: string) => boolean): Modulo[] {
  const selecionados = carregarModulos().filter((m) => filtro(m.arquivo));
  // Evita regras que passam "no vazio" se a estrutura de pastas mudar
  if (selecionados.length === 0) throw new Error('Nenhum módulo corresponde ao filtro da regra');
  return selecionados;
}

/** Lista "origem -> destino" para cada import interno proibido. */
export function violacoes(origens: Modulo[], proibido: (destino: string, origem: string) => boolean): string[] {
  return origens.flatMap((m) => m.internos.filter((d) => proibido(d, m.arquivo)).map((d) => `${m.arquivo} -> ${d}`));
}

export function violacoesExternas(origens: Modulo[], pacotes: string[]): string[] {
  return origens.flatMap((m) => m.externos.filter((p) => pacotes.includes(p)).map((p) => `${m.arquivo} -> ${p}`));
}

// --- Classificação dos arquivos pela convenção de pastas -------------------

const SERVICO = /^services\/([^/]+)\//;

export const servicoDe = (arquivo: string): string | undefined => SERVICO.exec(arquivo)?.[1];

export const camada = (arquivo: string): string | undefined => {
  const partes = arquivo.split('/');
  if (partes[0] === 'services') return partes[2]; // domain | application | features | infrastructure | <composition root>
  if (partes[0] === 'shared') return partes[1];
  return undefined;
};

/** Pasta da fatia vertical: services/<servico>/features/<fatia>/ */
export const fatiaDe = (arquivo: string): string | undefined =>
  /^services\/[^/]+\/features\/([^/]+)\//.exec(arquivo)?.[1];

export const ehAdaptadorHttp = (arquivo: string): boolean => arquivo.endsWith('.http.ts');

export const ehCompositionRoot = (arquivo: string): boolean =>
  /^services\/[^/]+\/[^/]+\.ts$/.test(arquivo) || arquivo === 'app.ts' || arquivo === 'server.ts';
