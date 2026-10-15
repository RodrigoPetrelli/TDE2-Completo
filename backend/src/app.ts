import path from 'path';
import { Express } from 'express';
import { criarBffMobile } from './bff/mobile/bff-mobile';
import { ClienteServicos } from './bff/compartilhado/cliente-servicos';
import { criarBffWeb } from './bff/web/bff-web';
import { criarApiGateway } from './gateway/api-gateway';
import { criarServicoCatalogo } from './services/catalogo/catalogo.service';
import { criarServicoClientes } from './services/clientes/clientes.service';
import { criarServicoNotificacoes } from './services/notificacoes/notificacoes.service';
import { criarServicoPedidos } from './services/pedidos/pedidos.service';
import { BarramentoEventosMemoria } from './shared/infrastructure/barramento-eventos-memoria';
import { GeradorIdUuid, RelogioSistema } from './shared/infrastructure/plataforma';

// Composition root do ambiente LOCAL: sobe gateway, BFFs e todos os microsserviços
// em um único processo, ligados por um barramento de eventos em memória.
// Na nuvem cada peça é implantada separadamente (ver docs/arc42, seção 7).

export interface OpcoesAplicacao {
  /** URL base que os BFFs usam para chamar os serviços (via gateway). */
  urlServicos?: () => string;
  limiteRequisicoesPorMinuto?: number;
}

export function criarAplicacao(opcoes: OpcoesAplicacao = {}): Express {
  const barramento = new BarramentoEventosMemoria();
  const plataforma = { eventos: barramento, ids: new GeradorIdUuid(), relogio: new RelogioSistema() };

  const catalogo = criarServicoCatalogo(plataforma);
  const clientes = criarServicoClientes(plataforma);
  const pedidos = criarServicoPedidos(plataforma);
  criarServicoNotificacoes(plataforma).assinarEm(barramento);

  const servicos = new ClienteServicos(
    opcoes.urlServicos ?? (() => process.env.SERVICOS_URL ?? `http://localhost:${Number(process.env.PORT) || 3000}`),
  );

  return criarApiGateway({
    limiteRequisicoesPorMinuto: opcoes.limiteRequisicoesPorMinuto,
    diretorioFrontend: path.resolve(__dirname, '../../frontend'),
    rotas: [
      { prefixo: '/api', destino: 'servico-catalogo', alvo: catalogo.router },
      { prefixo: '/api', destino: 'servico-clientes', alvo: clientes.router },
      { prefixo: '/api', destino: 'servico-pedidos', alvo: pedidos.router },
      { prefixo: '/bff/web', destino: 'bff-web', alvo: criarBffWeb(servicos) },
      { prefixo: '/bff/mobile', destino: 'bff-mobile', alvo: criarBffMobile(servicos) },
    ],
  });
}
