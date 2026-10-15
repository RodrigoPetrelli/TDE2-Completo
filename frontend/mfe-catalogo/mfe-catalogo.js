// Microfrontend do time de Catálogo: lista restaurantes e mostra a vitrine (via BFF Web).
class PedejaCatalogo extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<h2>Restaurantes</h2><ul class="lista"></ul><div class="vitrine"></div>';
    const restaurantes = await (await fetch(`${window.pedeja.api}/restaurantes`)).json();
    const lista = this.querySelector('.lista');
    for (const r of restaurantes) {
      const li = document.createElement('li');
      const botao = document.createElement('button');
      botao.textContent = `${r.nome} (${r.categoria})`;
      botao.onclick = () => this.abrir(r.id);
      li.append(botao);
      lista.append(li);
    }
    if (restaurantes.length === 0) lista.innerHTML = '<li>Nenhum restaurante cadastrado.</li>';
  }

  async abrir(restauranteId) {
    const vitrine = await (await fetch(`${window.pedeja.bff}/restaurantes/${restauranteId}/vitrine`)).json();
    const alvo = this.querySelector('.vitrine');
    alvo.innerHTML = `<h3>${vitrine.restaurante.nome}</h3>`;
    const ul = document.createElement('ul');
    for (const p of vitrine.cardapio) {
      const li = document.createElement('li');
      li.textContent = `${p.nome} — ${p.preco}`;
      ul.append(li);
    }
    alvo.append(ul);
    window.dispatchEvent(new CustomEvent(window.pedeja.EVENTOS.restauranteSelecionado, { detail: { restauranteId, cardapio: vitrine.cardapio } }));
  }
}

customElements.define('pedeja-catalogo', PedejaCatalogo);
