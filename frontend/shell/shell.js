// Contrato de integração entre microfrontends: eventos do DOM no window.
// Os MFEs não importam código uns dos outros; só publicam/escutam estes eventos.
export const EVENTOS = {
  restauranteSelecionado: 'pedeja:restaurante-selecionado', // detail: { restauranteId }
  pedidoCriado: 'pedeja:pedido-criado', // detail: { pedidoId, clienteId }
};

window.pedeja = { EVENTOS, bff: '/bff/web', api: '/api' };
