import express, { Express, RequestHandler, Router } from 'express';
import { randomUUID } from 'crypto';
import { tratadorErros } from '../shared/http/tratador-erros';

// API Gateway: ponto único de entrada. Responsável por preocupações transversais
// (correlation id, rate limiting, log de acesso, parsing) e pelo roteamento para
// microsserviços e BFFs. Na nuvem: Amazon API Gateway (HTTP API).

export interface RotaGateway {
  /** Prefixo público (ex.: "/api", "/bff/web"). */
  prefixo: string;
  /** Nome do destino, devolvido no cabeçalho x-servico (observabilidade). */
  destino: string;
  alvo: Router;
}

export interface OpcoesGateway {
  rotas: RotaGateway[];
  limiteRequisicoesPorMinuto?: number;
  diretorioFrontend?: string;
}

export function criarApiGateway(opcoes: OpcoesGateway): Express {
  const app = express();

  app.use(correlacao());
  app.use(limitarTaxa(opcoes.limiteRequisicoesPorMinuto ?? 600));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  for (const rota of opcoes.rotas) {
    app.use(
      rota.prefixo,
      (_req, res, next) => {
        res.setHeader('x-servico', rota.destino);
        next();
      },
      rota.alvo,
    );
  }

  if (opcoes.diretorioFrontend) {
    // Shell dos microfrontends (na nuvem: S3 + CloudFront)
    app.use(express.static(opcoes.diretorioFrontend));
  }

  app.use((_req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });
  app.use(tratadorErros);

  return app;
}

function correlacao(): RequestHandler {
  return (req, res, next) => {
    const id = req.header('x-request-id') ?? randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('x-request-id', id);
    next();
  };
}

/** Rate limiting por IP em janela fixa de 1 minuto. */
function limitarTaxa(limite: number): RequestHandler {
  const janelas = new Map<string, { inicio: number; total: number }>();
  return (req, res, next) => {
    const agora = Date.now();
    const chave = req.ip ?? 'desconhecido';
    const janela = janelas.get(chave);
    if (!janela || agora - janela.inicio >= 60_000) {
      janelas.set(chave, { inicio: agora, total: 1 });
      next();
      return;
    }
    janela.total += 1;
    if (janela.total > limite) {
      res.status(429).json({ erro: 'Limite de requisições excedido' });
      return;
    }
    next();
  };
}
