// Catálogo completo carregado pelo fetch — compartilhado entre todas as funções
let produtosGlobais = [];

// Carrinho persistido no localStorage para sobreviver a trocas de página
let carrinho = JSON.parse(localStorage.getItem('carrinhoCompras')) || [];


// =============================================================
// INICIALIZAÇÃO
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinhoHTML();

    fetch('products.json')
        .then(response => {
            if (!response.ok) throw new Error('Não foi possível carregar o catálogo de produtos.');
            return response.json();
        })
        .then(produtos => {
            produtosGlobais = produtos;

            // Roteamento: um único app.js serve index.html e produto.html
            if (document.getElementById('vitrine')) {
                renderizarVitrine(produtos);
            } else if (document.getElementById('detalhe-produto')) {
                renderizarPDP(produtos);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            const vitrine = document.getElementById('vitrine');
            if (vitrine) {
                vitrine.innerHTML = '<p style="color: #ff6b6b;">Erro ao carregar os produtos. Tente recarregar a página.</p>';
            }
        });
});


// =============================================================
// VITRINE
// =============================================================

function renderizarVitrine(produtos) {
    const vitrine = document.getElementById('vitrine');
    vitrine.innerHTML = '';

    if (produtos.length === 0) {
        vitrine.innerHTML = '<p style="color: var(--text-muted);">Nenhum jogo encontrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        // Produtos de assinatura exibem "a partir de" e botão "Ver Planos"
        if (produto.tipo === 'assinatura') {
            const menorPreco = produto.planos[0].preco;
            vitrine.innerHTML += `
                <div class="produto produto-assinatura">
                    <a href="produto.html?id=${produto.id}" style="text-decoration: none; color: inherit; display: block;">
                        <div class="badge-assinatura">Assinatura</div>
                        <img src="${produto.imagem}" alt="Capa do jogo ${produto.nome}" loading="lazy" width="300" height="400">
                        <h3>${produto.nome}</h3>
                        <p class="categoria">${produto.categoria}</p>
                    </a>
                    <p class="preco">A partir de R$ ${menorPreco.toFixed(2).replace('.', ',')}/mês</p>
                    <a href="produto.html?id=${produto.id}" class="btn-add btn-ver-planos">Ver Planos</a>
                </div>
            `;
            return;
        }

        vitrine.innerHTML += `
            <div class="produto">
                <a href="produto.html?id=${produto.id}" style="text-decoration: none; color: inherit; display: block;">
                    <img src="${produto.imagem}" alt="Capa do jogo ${produto.nome}" loading="lazy" width="300" height="400">
                    <h3>${produto.nome}</h3>
                    <p class="categoria">${produto.categoria}</p>
                </a>
                <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                <button class="btn-add" onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
            </div>
        `;
    });
}

// Chamada pelo oninput da busca no index.html
function filtrarProdutos() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = produtosGlobais.filter(p => p.nome.toLowerCase().includes(termo));
    renderizarVitrine(filtrados);
}


// =============================================================
// PDP (PÁGINA DE DETALHES DO PRODUTO)
// =============================================================

function renderizarPDP(produtos) {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = parseInt(urlParams.get('id'));
    const produto = produtos.find(p => p.id === produtoId);
    const detalheContainer = document.getElementById('detalhe-produto');

    if (!produto) {
        detalheContainer.innerHTML = '<h2>Produto não encontrado.</h2><a href="index.html" class="voltar">← Voltar para a Vitrine</a>';
        return;
    }

    document.title = `Calabouço do Pix | ${produto.nome}`;

    if (produto.tipo === 'assinatura') {
        renderizarPDPAssinatura(produto, detalheContainer);
        return;
    }

    detalheContainer.innerHTML = `
        <div class="pdp-grid">
            <div class="pdp-imagem">
                <img src="${produto.imagem}" alt="Capa do jogo ${produto.nome}" width="300" height="400">
            </div>
            <div class="pdp-info">
                <h2>${produto.nome}</h2>
                <span class="categoria">${produto.categoria}</span>
                <p class="descricao">${produto.descricao}</p>
                <div class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                <button class="btn-add" onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
            </div>
        </div>
        ${renderizarSecaoDLCs(produto)}
    `;
}

// Retorna HTML da seção de DLCs, ou string vazia se não houver nenhuma
function renderizarSecaoDLCs(produto) {
    if (!produto.dlcs || produto.dlcs.length === 0) return '';

    const dlcsHTML = produto.dlcs.map(dlc => `
        <div class="dlc-card">
            <img src="${dlc.imagem}" alt="${dlc.nome}" class="dlc-imagem" loading="lazy">
            <div class="dlc-info">
                <h4 class="dlc-nome">${dlc.nome}</h4>
                <p class="dlc-descricao">${dlc.descricao}</p>
                <div class="dlc-rodape">
                    <span class="dlc-preco">R$ ${dlc.preco.toFixed(2).replace('.', ',')}</span>
                    <button class="btn-dlc" onclick="adicionarDLCAoCarrinho(${produto.id}, '${dlc.id}')">
                        + Grimório
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <div class="dlcs-secao">
            <h3 class="dlcs-titulo">Conteúdo Adicional</h3>
            <div class="dlcs-lista">${dlcsHTML}</div>
        </div>
    `;
}

// DLC entra no carrinho com id composto para não colidir com o jogo base
function adicionarDLCAoCarrinho(produtoId, dlcId) {
    const produto = produtosGlobais.find(p => p.id === produtoId);
    if (!produto || !produto.dlcs) return;

    const dlc = produto.dlcs.find(d => d.id === dlcId);
    if (!dlc) return;

    carrinho.push({
        id: `${produtoId}-${dlcId}`,
        nome: `${produto.nome} — ${dlc.nome}`,
        preco: dlc.preco,
        tipo: 'dlc'
    });

    localStorage.setItem('carrinhoCompras', JSON.stringify(carrinho));
    atualizarCarrinhoHTML();
    abrirCarrinho();
}

// PDP para produtos de assinatura: exibe seletor de planos em vez de preço fixo
function renderizarPDPAssinatura(produto, container) {
    const planosHTML = produto.planos.map((plano, index) => {
        const checado = index === 0 ? 'checked' : '';
        const descontoHTML = plano.desconto
            ? `<span class="plano-desconto">${plano.desconto}</span>`
            : '';
        return `
            <label class="plano-opcao ${index === 0 ? 'selecionado' : ''}" for="plano-${plano.id}">
                <input type="radio" name="plano-wow" id="plano-${plano.id}"
                       value="${plano.id}" ${checado}
                       onchange="selecionarPlano(${produto.id}, '${plano.id}')">
                <div class="plano-info">
                    <span class="plano-label">${plano.label}</span>
                    <span class="plano-duracao">${plano.duracao}</span>
                </div>
                <div class="plano-preco-grupo">
                    ${descontoHTML}
                    <span class="plano-preco">R$ ${plano.preco.toFixed(2).replace('.', ',')}</span>
                </div>
            </label>
        `;
    }).join('');

    container.innerHTML = `
        <div class="pdp-grid">
            <div class="pdp-imagem">
                <img src="${produto.imagem}" alt="${produto.nome}" width="300" height="400">
            </div>
            <div class="pdp-info">
                <div class="badge-assinatura badge-assinatura-pdp">Assinatura Recorrente</div>
                <h2>${produto.nome}</h2>
                <span class="categoria">${produto.categoria}</span>
                <p class="descricao">${produto.descricao}</p>
                <div class="planos-container">
                    <h3 class="planos-titulo">Escolha seu plano</h3>
                    <div class="planos-lista" id="planos-lista">${planosHTML}</div>
                </div>
                <button class="btn-add" id="btn-assinar"
                        onclick="adicionarAssinaturaAoCarrinho(${produto.id})">
                    Assinar Agora
                </button>
            </div>
        </div>
    `;
}

// Atualiza o destaque visual do plano selecionado
function selecionarPlano(produtoId, planoId) {
    document.querySelectorAll('.plano-opcao').forEach(el => el.classList.remove('selecionado'));
    const radio = document.getElementById(`plano-${planoId}`);
    if (radio) radio.closest('.plano-opcao').classList.add('selecionado');
}

// Item de assinatura carrega os dados do plano escolhido para o checkout exibir corretamente
function adicionarAssinaturaAoCarrinho(produtoId) {
    const produto = produtosGlobais.find(p => p.id === produtoId);
    if (!produto) return;

    const radioMarcado = document.querySelector('input[name="plano-wow"]:checked');
    if (!radioMarcado) return;

    const planoSelecionado = produto.planos.find(p => p.id === radioMarcado.value);
    if (!planoSelecionado) return;

    carrinho.push({
        id: produto.id,
        nome: produto.nome,
        planoLabel: planoSelecionado.label,
        planoId: planoSelecionado.id,
        preco: planoSelecionado.preco,
        tipo: 'assinatura'
    });

    localStorage.setItem('carrinhoCompras', JSON.stringify(carrinho));
    atualizarCarrinhoHTML();
    abrirCarrinho();
}


// =============================================================
// CARRINHO
// =============================================================

function adicionarAoCarrinho(idProduto) {
    const produto = produtosGlobais.find(p => p.id === idProduto);
    if (!produto) return;

    carrinho.push(produto);
    localStorage.setItem('carrinhoCompras', JSON.stringify(carrinho));
    atualizarCarrinhoHTML();
    abrirCarrinho();
}

function atualizarCarrinhoHTML() {
    const lista = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total-carrinho');
    const contador = document.getElementById('cart-count');

    // Esses elementos não existem no checkout — sai para evitar erro
    if (!lista || !totalElement || !contador) return;

    lista.innerHTML = '';
    let total = 0;
    contador.innerText = carrinho.length;

    if (carrinho.length === 0) {
        lista.innerHTML = '<li style="color: var(--text-muted);">Seu carrinho está vazio.</li>';
    } else {
        carrinho.forEach((item, index) => {
            total += item.preco;

            const subLabel = item.tipo === 'assinatura'
                ? `<span style="color: var(--text-muted); font-size: 12px; display: block;">Plano ${item.planoLabel}</span>`
                : '';

            lista.innerHTML += `
                <li>
                    <span>${item.nome}${subLabel}</span>
                    <span>R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                    <button class="btn-remover" onclick="removerDoCarrinho(${index})" aria-label="Remover ${item.nome} do carrinho">✕</button>
                </li>
            `;
        });
    }

    totalElement.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinhoCompras', JSON.stringify(carrinho));
    atualizarCarrinhoHTML();
}

function abrirCarrinho() {
    document.getElementById('carrinho-lateral').classList.add('ativo');
    document.getElementById('overlay').classList.add('ativo');
}

function toggleCarrinho() {
    document.getElementById('carrinho-lateral').classList.toggle('ativo');
    document.getElementById('overlay').classList.toggle('ativo');
}

function iniciarCheckout() {
    if (carrinho.length === 0) {
        alert('Adicione pelo menos um RPG ao grimório antes de finalizar!');
        return;
    }
    window.location.href = 'checkout.html';
}
