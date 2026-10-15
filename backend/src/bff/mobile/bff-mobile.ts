import { Router } from 'express';
import { ClienteServicos, formatarReais } from '../compartilhado/cliente-servicos';
import { rotaBff } from '../compartilhado/http';

// BFF do app Mobile: payloads enxutos (menos bytes na rede móvel).

interface Pedido {
  id: string;
  status: string;
  totalCentavos: number;
  itens: { quantidade: number }[];
}

export function criarBffMobile(servicos: ClienteServicos): Router {
  const router = Router();

  router.get(
    '/pedidos/:id',
    rotaBff(async (req, res) => {
      const pedido = await servicos.obter<Pedido>(`/api/pedidos/${req.params.id}`, req.header('x-request-id'));
      res.json({
        id: pedido.id,
        status: pedido.status,
        total: formatarReais(pedido.totalCentavos),
        itens: pedido.itens.reduce((soma, i) => soma + i.quantidade, 0),
      });
    }),
  );

  return router;
}
