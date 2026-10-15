import { DependenciasPlataforma, novoEvento } from '../../../../shared/application/portas';
import { ErroNaoEncontrado, ErroValidacao } from '../../../../shared/domain/erros';
import { textoObrigatorio } from '../../../../shared/domain/validacoes';
import { CatalogoLocalRepositorio, ClientesLocalRepositorio, PedidoRepositorio } from '../../application/portas';
import { DadosPedido, LinhaPedido, Pedido } from '../../domain/pedido';

export interface CriarPedidoEntrada {
  clienteId?: unknown;
  restauranteId?: unknown;
  itens?: unknown;
}

interface ItemSolicitado {
  produtoId: string;
  quantidade: unknown;
}

export class CriarPedido {
  constructor(
    private readonly deps: DependenciasPlataforma & {
      pedidos: PedidoRepositorio;
      catalogo: CatalogoLocalRepositorio;
      clientes: ClientesLocalRepositorio;
    },
  ) {}

  async executar(entrada: CriarPedidoEntrada): Promise<DadosPedido> {
    // 1. Formato (400)
    const clienteId = textoObrigatorio(entrada.clienteId, 'clienteId');
    const restauranteId = textoObrigatorio(entrada.restauranteId, 'restauranteId');
    const itens = validarItens(entrada.itens);

    // 2. Existência (404) — consultando apenas as réplicas locais deste serviço
    if (!(await this.deps.clientes.existe(clienteId))) {
      throw new ErroNaoEncontrado('Cliente não encontrado');
    }
    const restaurante = await this.deps.catalogo.obterRestaurante(restauranteId);
    if (!restaurante) throw new ErroNaoEncontrado('Restaurante não encontrado');

    const linhas: LinhaPedido[] = [];
    for (const item of itens) {
      const produto = await this.deps.catalogo.obterProduto(item.produtoId);
      if (!produto) throw new ErroNaoEncontrado(`Produto ${item.produtoId} não encontrado`);
      linhas.push({ produto, quantidade: item.quantidade as number });
    }

    // 3. Regras de negócio (422) e cálculo do total — no agregado
    const pedido = Pedido.criar({
      id: this.deps.ids.gerar(),
      clienteId,
      restauranteId: restaurante.id,
      linhas,
      agora: this.deps.relogio.agoraIso(),
    });
    await this.deps.pedidos.salvar(pedido);

    // 4. Evento de integração: a notificação é responsabilidade de outro serviço
    const dados = pedido.paraDados();
    await this.deps.eventos.publicar(
      novoEvento(
        'pedidos.PedidoCriado',
        {
          pedidoId: dados.id,
          clienteId: dados.clienteId,
          restauranteId: dados.restauranteId,
          restauranteNome: restaurante.nome,
          quantidadeItens: dados.itens.reduce((soma, i) => soma + i.quantidade, 0),
          totalCentavos: dados.totalCentavos,
        },
        this.deps,
      ),
    );
    return dados;
  }
}

function validarItens(itens: unknown): ItemSolicitado[] {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new ErroValidacao('O pedido deve ter pelo menos 1 item');
  }
  return itens.map((item: unknown) => {
    if (typeof item !== 'object' || item === null) {
      throw new ErroValidacao('Item do pedido inválido');
    }
    const { produtoId, quantidade } = item as Record<string, unknown>;
    if (typeof produtoId !== 'string' || produtoId.trim() === '') {
      throw new ErroValidacao('Cada item deve informar o "produtoId"');
    }
    if (typeof quantidade !== 'number' || !Number.isInteger(quantidade) || quantidade <= 0) {
      throw new ErroValidacao('A "quantidade" de cada item deve ser um inteiro maior que zero');
    }
    return { produtoId, quantidade };
  });
}
