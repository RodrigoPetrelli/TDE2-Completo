import { AddressInfo } from 'net';
import { Server } from 'http';
import { criarAplicacao } from '../../src/app';

// BFFs chamam os serviços por HTTP através do gateway, então aqui o app escuta
// em uma porta real (efêmera).

describe('Backend for Frontend', () => {
  let servidor: Server;
  let url = '';

  beforeAll((pronto) => {
    servidor = criarAplicacao({ urlServicos: () => url }).listen(0, () => {
      url = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
      pronto();
    });
  });
  afterAll((pronto) => {
    servidor.close(() => pronto());
  });
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => undefined));
  afterEach(() => jest.restoreAllMocks());

  async function post<T>(caminho: string, corpo: unknown): Promise<T> {
    const r = await fetch(url + caminho, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
    return (await r.json()) as T;
  }

  it('Web: monta a vitrine e o histórico do cliente agregando Catálogo e Pedidos', async () => {
    const r = await post<{ id: string }>('/api/restaurantes', { nome: 'Sushi Ya', categoria: 'Japonesa' });
    const p1 = await post<{ id: string }>(`/api/restaurantes/${r.id}/produtos`, { nome: 'Combo', precoCentavos: 4990 });
    await post(`/api/restaurantes/${r.id}/produtos`, { nome: 'Temaki', precoCentavos: 2500, disponivel: false });
    const c = await post<{ id: string }>('/api/clientes', { nome: 'João', email: 'joao@exemplo.com' });
    const pedido = await post<{ id: string }>('/api/pedidos', { clienteId: c.id, restauranteId: r.id, itens: [{ produtoId: p1.id, quantidade: 1 }] });

    const vitrine = await (await fetch(`${url}/bff/web/restaurantes/${r.id}/vitrine`)).json();
    expect(vitrine).toEqual({
      restaurante: { id: r.id, nome: 'Sushi Ya', categoria: 'Japonesa' },
      cardapio: [{ id: p1.id, nome: 'Combo', precoCentavos: 4990, preco: 'R$ 49,90' }],
    });

    const historico = await (await fetch(`${url}/bff/web/clientes/${c.id}/pedidos`)).json();
    expect(historico).toEqual([expect.objectContaining({ id: pedido.id, restaurante: 'Sushi Ya', total: 'R$ 57,80', status: 'CRIADO' })]);

    const mobile = await (await fetch(`${url}/bff/mobile/pedidos/${pedido.id}`)).json();
    expect(mobile).toEqual({ id: pedido.id, status: 'CRIADO', total: 'R$ 57,80', itens: 1 });
  });

  it('repassa o erro do serviço chamado', async () => {
    const resposta = await fetch(`${url}/bff/mobile/pedidos/nao-existe`);
    expect(resposta.status).toBe(404);
    expect(resposta.headers.get('x-servico')).toBe('bff-mobile');
    expect(await resposta.json()).toEqual({ erro: 'Pedido não encontrado' });
  });
});
