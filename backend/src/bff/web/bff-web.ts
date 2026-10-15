import { Router } from 'express';
import { ClienteServicos, formatarReais } from '../compartilhado/cliente-servicos';
import { rotaBff } from '../compartilhado/http';

// BFF do canal Web (microfrontends). Agrega chamadas a vários serviços em uma
// única resposta moldada para as telas.

interface Restaurante {
  id: string;
  nome: string;
  categoria: string;
}

interface Produto {
  id: string;
  nome: string;
  precoCentavos: number;
  disponivel: boolean;
}

interface Pedido {
  id: string;
  restauranteId: string;
  status: string;
  totalCentavos: number;
  itens: { quantidade: number }[];
  criadoEm: string;
}

export function criarBffWeb(servicos: ClienteServicos): Router {
  const router = Router();

  // Vitrine = Catálogo (restaurante) + Catálogo (cardápio), só itens disponíveis
  router.get(
    '/restaurantes/:id/vitrine',
    rotaBff(async (req, res) => {
      const rid = req.header('x-request-id');
      const [restaurante, produtos] = await Promise.all([
        servicos.obter<Restaurante>(`/api/restaurantes/${req.params.id}`, rid),
        servicos.obter<Produto[]>(`/api/restaurantes/${req.params.id}/produtos`, rid),
      ]);
      res.json({
        restaurante: { id: restaurante.id, nome: restaurante.nome, categoria: restaurante.categoria },
        cardapio: produtos
          .filter((p) => p.disponivel)
          .map((p) => ({ id: p.id, nome: p.nome, precoCentavos: p.precoCentavos, preco: formatarReais(p.precoCentavos) })),
      });
    }),
  );

  // Histórico = Pedidos + Catálogo (nome do restaurante de cada pedido)
  router.get(
    '/clientes/:id/pedidos',
    rotaBff(async (req, res) => {
      const rid = req.header('x-request-id');
      const pedidos = await servicos.obter<Pedido[]>(`/api/clientes/${req.params.id}/pedidos`, rid);
      const ids = [...new Set(pedidos.map((p) => p.restauranteId))];
      const restaurantes = await Promise.all(ids.map((id) => servicos.obter<Restaurante>(`/api/restaurantes/${id}`, rid)));
      const nomes = new Map(restaurantes.map((r) => [r.id, r.nome]));

      res.json(
        pedidos.map((p) => ({
          id: p.id,
          restaurante: nomes.get(p.restauranteId) ?? '—',
          status: p.status,
          total: formatarReais(p.totalCentavos),
          criadoEm: p.criadoEm,
        })),
      );
    }),
  );

  return router;
}
