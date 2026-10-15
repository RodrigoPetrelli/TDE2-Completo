// Contratos dos eventos de integração (published language da EDA).
// É o ÚNICO ponto de acoplamento permitido entre microsserviços: nenhum serviço
// importa código de outro, apenas estes tipos.

interface Envelope<T extends string, D> {
  id: string;
  tipo: T;
  ocorridoEm: string;
  dados: D;
}

export type RestauranteCriado = Envelope<
  'catalogo.RestauranteCriado',
  { restauranteId: string; nome: string; categoria: string }
>;

export type ProdutoCadastrado = Envelope<
  'catalogo.ProdutoCadastrado',
  { produtoId: string; restauranteId: string; nome: string; precoCentavos: number; disponivel: boolean }
>;

export type ClienteCadastrado = Envelope<'clientes.ClienteCadastrado', { clienteId: string; nome: string; email: string }>;

export type PedidoCriado = Envelope<
  'pedidos.PedidoCriado',
  {
    pedidoId: string;
    clienteId: string;
    restauranteId: string;
    restauranteNome: string;
    quantidadeItens: number;
    totalCentavos: number;
  }
>;

export type PedidoConfirmado = Envelope<'pedidos.PedidoConfirmado', { pedidoId: string; clienteId: string; restauranteId: string }>;

export type PedidoCancelado = Envelope<'pedidos.PedidoCancelado', { pedidoId: string; clienteId: string; restauranteId: string }>;

export type EventoIntegracao =
  | RestauranteCriado
  | ProdutoCadastrado
  | ClienteCadastrado
  | PedidoCriado
  | PedidoConfirmado
  | PedidoCancelado;

export type TipoEvento = EventoIntegracao['tipo'];

export type EventoDoTipo<T extends TipoEvento> = Extract<EventoIntegracao, { tipo: T }>;
