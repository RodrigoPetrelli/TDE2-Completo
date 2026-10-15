# PedeJá

Plataforma de pedidos de delivery de restaurante (TDE 2 — Arquitetura de Software em Nuvem).

**Documentação de arquitetura (arc42 + C4 + UML + DER + Canvas):** [`docs/arquitetura/PedeJa-Arquitetura-arc42.pdf`](docs/arquitetura/PedeJa-Arquitetura-arc42.pdf)

## Estilos arquiteturais

| Estilo | Onde |
| --- | --- |
| Microsserviços + Database per Service | `backend/src/services/{catalogo,clientes,pedidos,notificacoes}`, cada um com repositórios próprios |
| Arquitetura Orientada a Eventos | `backend/src/shared/contracts/eventos.ts`, `BarramentoEventos` (local: memória; nuvem: EventBridge) |
| API Gateway | `backend/src/gateway/api-gateway.ts` (correlation id, rate limiting, roteamento) |
| Backend for Frontend | `backend/src/bff/web`, `backend/src/bff/mobile` |
| Serverless | `backend/src/services/notificacoes/lambda.ts` (handler AWS Lambda acionado por EventBridge) |
| Microfrontends | `frontend/` (shell + `<pedeja-catalogo>` + `<pedeja-pedidos>`) |
| Clean Architecture + Vertical Slice | `services/<svc>/{domain,application,features/<fatia>,infrastructure}` |
| Testes unitários de arquitetura | `backend/tests/arquitetura/*.test.ts` |

## Como rodar

```bash
cd backend && npm install && npm run dev
```

Sobe API Gateway, BFFs e microsserviços em `http://localhost:3000` (ou `PORT`). A tela dos microfrontends fica em `/`.

Outros scripts: `npm run build`, `npm start`, `npm test` (unitários, e2e e de arquitetura).

## Endpoints

Valores monetários em centavos (inteiros). Erros retornam `{ "erro": "mensagem" }` (400 validação, 404 não encontrado, 422 regra de negócio, 429 rate limit).

| Método | Rota | Serviço | Descrição |
| --- | --- | --- | --- |
| GET | `/health` | gateway | Health check |
| POST | `/api/restaurantes` | catálogo | Cria restaurante (`nome`, `categoria`) |
| GET | `/api/restaurantes` | catálogo | Lista restaurantes |
| GET | `/api/restaurantes/:id` | catálogo | Consulta restaurante |
| POST | `/api/restaurantes/:id/produtos` | catálogo | Cria produto (`nome`, `precoCentavos` > 0, `disponivel`) |
| GET | `/api/restaurantes/:id/produtos` | catálogo | Lista o cardápio |
| POST | `/api/clientes` | clientes | Cria cliente (`nome`, `email` válido e único) |
| GET | `/api/clientes/:id` | clientes | Consulta cliente |
| GET | `/api/clientes/:id/pedidos` | pedidos | Lista pedidos do cliente |
| POST | `/api/pedidos` | pedidos | Cria pedido (`clienteId`, `restauranteId`, `itens: [{ produtoId, quantidade }]`) |
| GET | `/api/pedidos/:id` | pedidos | Consulta pedido |
| PATCH | `/api/pedidos/:id/confirmar` | pedidos | CRIADO -> CONFIRMADO |
| PATCH | `/api/pedidos/:id/cancelar` | pedidos | Cancela pedido CRIADO ou CONFIRMADO |
| GET | `/bff/web/restaurantes/:id/vitrine` | BFF Web | Restaurante + cardápio disponível |
| GET | `/bff/web/clientes/:id/pedidos` | BFF Web | Histórico com nome do restaurante |
| GET | `/bff/mobile/pedidos/:id` | BFF Mobile | Resumo enxuto do pedido |

## Documentação

Os fontes dos diagramas (PlantUML / C4-PlantUML) ficam em `docs/arquitetura/diagramas`, o texto arc42 em `docs/arquitetura/arc42.html` e os nomes do grupo em `docs/arquitetura/grupo.json`. Para regenerar o PDF (requer Java 11+ e Edge ou Chrome):

```bash
cd docs/arquitetura && npm install && npm run build
```
