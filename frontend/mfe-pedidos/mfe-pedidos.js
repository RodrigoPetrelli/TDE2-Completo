// Microfrontend do time de Pedidos: monta o pedido do restaurante selecionado
// e mostra o histórico do cliente (via BFF Web).
class PedejaPedidos extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h2>Meu pedido</h2>
      <label>ID do cliente <input name="cliente" size="38" /></label>
      <div class="itens"><p>Selecione um restaurante.</p></div>
      <button class="enviar" disabled>Fazer pedido</button>
      <h3>Histórico</h3><ul class="historico"></ul>`;
    window.addEventListener(window.pedeja.EVENTOS.restauranteSelecionado, (e) => this.preparar(e.detail));
    this.querySelector('.enviar').onclick = () => this.enviar();
  }

  preparar({ restauranteId, cardapio }) {
    this.restauranteId = restauranteId;
    const itens = this.querySelector('.itens');
    itens.innerHTML = '';
    for (const p of cardapio) {
      const label = document.createElement('label');
      label.innerHTML = `<input type="number" min="0" value="0" data-produto="${p.id}" style="width:4em" /> ${p.nome} (${p.preco})`;
      itens.append(label, document.createElement('br'));
    }
    this.querySelector('.enviar').disabled = cardapio.length === 0;
  }

  async enviar() {
    const clienteId = this.querySelector('input[name=cliente]').value.trim();
    const itens = [...this.querySelectorAll('input[data-produto]')]
      .map((i) => ({ produtoId: i.dataset.produto, quantidade: Number(i.value) }))
      .filter((i) => i.quantidade > 0);
    const resposta = await fetch(`${window.pedeja.api}/pedidos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clienteId, restauranteId: this.restauranteId, itens }),
    });
    const corpo = await resposta.json();
    if (!resposta.ok) return alert(corpo.erro);
    window.dispatchEvent(new CustomEvent(window.pedeja.EVENTOS.pedidoCriado, { detail: { pedidoId: corpo.id, clienteId } }));
    await this.carregarHistorico(clienteId);
  }

  async carregarHistorico(clienteId) {
    const pedidos = await (await fetch(`${window.pedeja.bff}/clientes/${clienteId}/pedidos`)).json();
    const ul = this.querySelector('.historico');
    ul.innerHTML = '';
    for (const p of pedidos) {
      const li = document.createElement('li');
      li.textContent = `${p.restaurante} — ${p.total} — ${p.status}`;
      ul.append(li);
    }
  }
}

customElements.define('pedeja-pedidos', PedejaPedidos);
