import { criarAplicacao } from './app';

const porta = Number(process.env.PORT) || 3000;

criarAplicacao().listen(porta, () => {
  console.log(`PedeJá rodando em http://localhost:${porta} (API Gateway + BFFs + microsserviços)`);
});
