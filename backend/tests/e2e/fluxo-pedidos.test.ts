import request from 'supertest';
import { criarAplicacao } from '../../src/app';

describe('Fluxo de pedidos (via API Gateway)', () => {
  const app = criarAplicacao();

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('cria restaurante, produto, cliente, pedido e cancela o pedido', async () => {
    const restaurante = await request(app)
      .post('/api/restaurantes')
      .send({ nome: 'Cantina da Nona', categoria: 'Italiana' })
      .expect(201);
    expect(restaurante.body.id).toEqual(expect.any(String));
    expect(restaurante.headers['x-request-id']).toEqual(expect.any(String));

    const produto = await request(app)
      .post(`/api/restaurantes/${restaurante.body.id}/produtos`)
      .send({ nome: 'Lasanha', precoCentavos: 3500, disponivel: true })
      .expect(201);
    expect(produto.body.precoCentavos).toBe(3500);

    const cliente = await request(app).post('/api/clientes').send({ nome: 'Maria', email: 'maria@exemplo.com' }).expect(201);

    const pedido = await request(app)
      .post('/api/pedidos')
      .send({
        clienteId: cliente.body.id,
        restauranteId: restaurante.body.id,
        itens: [{ produtoId: produto.body.id, quantidade: 2 }],
      })
      .expect(201);

    expect(pedido.body.status).toBe('CRIADO');
    expect(pedido.body.taxaEntregaCentavos).toBe(790);
    expect(pedido.body.totalCentavos).toBe(2 * 3500 + 790);
    // Notificação feita pelo serviço de Notificações, desacoplado via evento
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Notificação enviada ao restaurante'));

    const cancelado = await request(app).patch(`/api/pedidos/${pedido.body.id}/cancelar`).expect(200);
    expect(cancelado.body.status).toBe('CANCELADO');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`seu pedido ${pedido.body.id} foi cancelado`));

    const cancelarDeNovo = await request(app).patch(`/api/pedidos/${pedido.body.id}/cancelar`).expect(422);
    expect(cancelarDeNovo.body).toEqual({ erro: expect.any(String) });

    const historico = await request(app).get(`/api/clientes/${cliente.body.id}/pedidos`).expect(200);
    expect(historico.body).toHaveLength(1);
  });

  it('mapeia erros de domínio para 400 / 404 / 422', async () => {
    await request(app).post('/api/restaurantes').send({ categoria: 'X' }).expect(400, { erro: 'O campo "nome" é obrigatório' });
    await request(app).get('/api/pedidos/inexistente').expect(404, { erro: 'Pedido não encontrado' });
    await request(app).post('/api/clientes').send({ nome: 'A', email: 'dup@x.com' }).expect(201);
    await request(app).post('/api/clientes').send({ nome: 'B', email: 'DUP@x.com' }).expect(422);
    await request(app).post('/api/pedidos').set('Content-Type', 'application/json').send('{ruim').expect(400);
    await request(app).get('/api/nao-existe').expect(404, { erro: 'Rota não encontrada' });
  });

  it('aplica rate limiting no gateway', async () => {
    const limitado = criarAplicacao({ limiteRequisicoesPorMinuto: 2 });
    await request(limitado).get('/health').expect(200);
    await request(limitado).get('/health').expect(200);
    await request(limitado).get('/health').expect(429);
  });
});
