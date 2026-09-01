# Calabouço do Pix

Loja virtual fictícia de jogos RPG, construída com HTML, CSS e JavaScript puro — sem frameworks, sem dependências, sem build step.

Projeto desenvolvido como exercício prático de front-end durante o **Bootcamp | AWS AI FDE for Commerce**.

---

## Funcionalidades

- **Vitrine dinâmica** — cards de produtos gerados via JavaScript a partir de um arquivo JSON
- **Busca em tempo real** — filtra jogos pelo nome enquanto o usuário digita
- **Página de detalhes (PDP)** — roteamento por query string (`?id=`), imagem, descrição e preço
- **DLCs na PDP** — seção de conteúdo adicional com imagem, descrição e botão de compra separado
- **Carrinho lateral (off-canvas)** — adicionar, remover e visualizar itens sem sair da página; estado persistido no `localStorage`
- **Sistema de assinatura** — produto com seletor de planos e preços por período (ex: World of Warcraft)
- **Checkout simulado** — resumo do pedido com dois métodos de pagamento:
  - Cartão de crédito (campos fictícios)
  - PIX com **5% de desconto** aplicado automaticamente no total
- **Modal de confirmação** — diferente para cada método de pagamento

---

## Estrutura do projeto

```
minha-loja/
├── index.html       # Vitrine — lista todos os produtos
├── produto.html     # PDP — detalhes de um produto específico
├── checkout.html    # Checkout — resumo do pedido e pagamento
├── como-fiz.html    # Página de documentação do projeto
├── app.js           # Toda a lógica: fetch, renderização, carrinho
├── style.css        # Estilos globais, tema dark, componentes
└── products.json    # Catálogo de produtos (fonte de dados)
```

---

## Catálogo

20 jogos organizados por franquia:

| Franquia | Títulos |
|---|---|
| Baldur's Gate | Enhanced Edition, II Enhanced Edition, 3 |
| Divinity | Original Sin EE, Original Sin 2 DE |
| The Elder Scrolls | Oblivion Remastered, Skyrim |
| Dragon Age | Origins, II, Inquisition, The Veilguard |
| Souls / FromSoftware | Dark Souls Remastered, DS II Scholar, DS III, Elden Ring |
| Obsidian | Pathfinder: WotR, Pillars of Eternity II, Tyranny, Avowed |
| Blizzard | World of Warcraft (assinatura) |

Jogos com DLCs cadastradas: Baldur's Gate 3, Divinity OS 2, Dragon Age: Inquisition, Pathfinder: WotR, Dark Souls III, Elden Ring, Avowed.

---

## Como rodar localmente

O `fetch('products.json')` no `app.js` é bloqueado pelo navegador quando a página é aberta diretamente pelo explorador de arquivos (`file://`). É necessário um servidor HTTP local.

**Com Node.js instalado:**

```bash
npx serve .
```

Acesse `http://localhost:3000` no navegador.

**Com a extensão Live Server (VS Code / Kiro):**

Abra o `index.html` e clique em **Go Live** na barra de status.

---

## Estrutura do `products.json`

**Produto padrão:**
```json
{
  "id": 3,
  "nome": "Baldur's Gate 3",
  "categoria": "RPG / Dungeons & Dragons",
  "preco": 199.99,
  "imagem": "https://...",
  "descricao": "...",
  "dlcs": [
    {
      "id": "bg3-deluxe",
      "nome": "Digital Deluxe Edition DLC",
      "descricao": "...",
      "preco": 97.45,
      "imagem": "https://..."
    }
  ]
}
```

**Produto de assinatura:**
```json
{
  "id": 19,
  "nome": "World of Warcraft",
  "tipo": "assinatura",
  "imagem": "https://...",
  "descricao": "...",
  "planos": [
    { "id": "wow-1m",  "label": "1 mês",   "duracao": "30 dias",  "preco": 54.90 },
    { "id": "wow-3m",  "label": "3 meses",  "duracao": "90 dias",  "preco": 153.71, "desconto": "6% de desconto" }
  ]
}
```

---

## Conceitos aplicados

- **Headless Commerce** — catálogo desacoplado do HTML; o JS monta a UI a partir dos dados
- **Roteamento client-side simples** — um único `app.js` detecta em qual página está pelo `id` dos elementos e chama a função correspondente
- **Persistência com localStorage** — o carrinho sobrevive a trocas de página e recarregamentos
- **Fetch API + Promises** — carregamento assíncrono do JSON com tratamento de erro
- **Template literals** — geração de HTML dinâmico sem biblioteca de templates

---

## Tecnologias

- HTML5
- CSS3 (variáveis, flexbox, grid, animações)
- JavaScript ES6+ (sem frameworks)

Nenhuma dependência externa. Nenhum `npm install`.
