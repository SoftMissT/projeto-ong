// router.js
// Lógica central da Single Page Application. Responsável por:
//   1. Interceptar cliques em links internos (evitando o reload padrão);
//   2. Atualizar a URL via History API (pushState / popstate);
//   3. Trocar o innerHTML de <main id="app"> pelo fragmento certo;
//   4. Atualizar o item ativo do menu e o <title> da aba.
//
// Este é o arquivo "de mais alto nível" do projeto: importa de
// routes.js (o mapa de rotas) e de validacao.js/armazenamento.js
// (a lógica de submit do formulário). Nada importa DELE — é a raiz
// da árvore de dependências, e é por isso que é o único <script
// type="module"> referenciado no HTML: o navegador segue a cadeia
// de imports a partir daqui.
import { routes } from "./routes.js";
import { validarFormulario } from "./validacao.js";
import { extrairDadosFormulario, salvarCadastro } from "./armazenamento.js";

const appEl = document.getElementById("app");

// ------------------------------------------------------------
// BUG CORRIGIDO: o roteador assumia que a aplicação sempre vive na
// raiz do domínio ("/"), comparando window.location.pathname
// diretamente contra as chaves de `routes` ('/', '/projetos', ...).
// Mas o projeto é servido a partir de /html/index.html (pasta
// obrigatória pela arquitetura de diretórios) — então o pathname
// real é "/html/" (ou "/html/index.html"), que não bate com
// NENHUMA chave do mapa de rotas. Resultado: a página caía direto
// no fallback "Página não encontrada" já no primeiro carregamento,
// mesmo com tudo implementado corretamente.
//
// A correção: descobrir dinamicamente o diretório onde o documento
// atual está (BASE_PATH) e usá-lo para traduzir nos dois sentidos —
// de "caminho real do navegador" para "chave de rota", e vice-versa.
// new URL('.', window.location.href) resolve para a URL do diretório
// PAI do documento atual (equivalente a um "cd .." na URL).
const BASE_PATH = new URL(".", window.location.href).pathname;

/**
 * Converte um pathname real do navegador (ex.: "/html/projetos")
 * na chave usada no mapa `routes` (ex.: "/projetos").
 */
function paraChaveDeRota(pathname) {
  if (!pathname.startsWith(BASE_PATH)) return pathname;
  const resto = pathname.slice(BASE_PATH.length);
  return resto === "" ? "/" : "/" + resto;
}

/**
 * Caminho inverso: converte uma chave de rota (ex.: "/projetos") no
 * caminho real que deve aparecer na barra de endereço (ex.:
 * "/html/projetos"), preservando o BASE_PATH de onde a aplicação
 * está de fato instalada.
 */
function paraCaminhoReal(chaveRota) {
  return chaveRota === "/" ? BASE_PATH : BASE_PATH + chaveRota.slice(1);
}

/**
 * Renderiza a rota correspondente ao caminho informado dentro do
 * elemento <main id="app">. Se o caminho não existir no mapa de
 * rotas, cai num fallback simples de "página não encontrada".
 * O parâmetro `hash` (opcional) é usado para rolar até uma seção
 * específica DEPOIS que o novo conteúdo entra no DOM — necessário
 * porque, numa SPA, a seção-alvo pode nem existir ainda no momento
 * do clique (só passa a existir depois do innerHTML ser trocado).
 */
function renderRoute(path, hash = "") {
  const rota = routes[path] || {
    render: () =>
      "<h1>Página não encontrada</h1><p>O conteúdo que você procura não existe.</p>",
    title: "Página não encontrada",
  };

  // 1) Limpa o container e injeta o novo fragmento de HTML.
  //    innerHTML = '' remove todos os nós filhos atuais; em seguida,
  //    o innerHTML recebe a string retornada pela função de render.
  appEl.innerHTML = "";
  appEl.innerHTML = rota.render();

  // 2) Atualiza o <title> da aba do navegador.
  document.title = rota.title;

  // 3) Marca visualmente o link ativo no menu (aria-current).
  //    Só os itens de PRIMEIRO NÍVEL (filhos diretos de <ul>) recebem
  //    a marcação — ver "Bug 2" abaixo sobre por que isso importa
  //    para o submenu de Projetos.
  document.querySelectorAll("nav > ul > li > a[data-link]").forEach((link) => {
    const linkPath = paraChaveDeRota(new URL(link.href).pathname);
    if (linkPath === path) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  // 4) Fecha o menu hambúrguer mobile, se estiver aberto. BUG
  //    CORRIGIDO: como o menu usa o checkbox hack (puro CSS, sem
  //    JS), nada desmarcava o checkbox depois de uma navegação —
  //    resultado: no mobile, tocar num link dentro do menu aberto
  //    trocava a rota corretamente, mas o painel do menu continuava
  //    visível por cima do novo conteúdo, exigindo um segundo toque
  //    manual no ícone para fechar.
  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle) menuToggle.checked = false;

  // 5) Executa o hook "after", se a rota tiver um (ex.: religar as
  //    máscaras de CPF/telefone/CEP depois que o <form> acabou de
  //    ser injetado no DOM).
  if (typeof rota.after === "function") {
    rota.after();
  }

  // 6) Rola até a seção-alvo se um hash foi informado; caso
  //    contrário, volta ao topo — sem isso, uma rota nova herdaria
  //    visualmente a posição de scroll da rota anterior.
  if (hash) {
    const alvo = document.getElementById(hash.replace("#", ""));
    if (alvo) {
      alvo.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }
  window.scrollTo(0, 0);
}

/**
 * Navega programaticamente para um novo caminho: empurra uma nova
 * entrada no histórico do navegador (sem recarregar o documento) e
 * então renderiza a rota correspondente.
 */
function navegarPara(chaveRota, hash = "") {
  history.pushState(null, "", paraCaminhoReal(chaveRota) + hash);
  renderRoute(chaveRota, hash);
}

/**
 * Intercepta cliques em QUALQUER link marcado com o atributo
 * data-link. Usamos delegação de evento no document inteiro (em vez
 * de um listener por link) porque os links são recriados toda vez
 * que uma rota é renderizada — um listener preso a um elemento
 * específico seria perdido assim que aquele elemento fosse
 * substituído pelo innerHTML da próxima rota.
 */
document.addEventListener("click", (evento) => {
  const link = evento.target.closest("a[data-link]");
  if (!link) return; // clique não foi em um link de navegação interna

  evento.preventDefault(); // impede o navegador de recarregar o documento
  const url = new URL(link.href);
  navegarPara(paraChaveDeRota(url.pathname), url.hash);
});

/**
 * Listener delegado de "submit", no mesmo espírito do de "click":
 * o <form> de cadastro só existe depois que a rota "/cadastro" é
 * renderizada, então um listener preso diretamente ao elemento
 * seria perdido a cada nova navegação. Escutando no `document`,
 * o listener sobrevive a qualquer troca de rota.
 */
document.addEventListener("submit", (evento) => {
  const form = evento.target.closest("form");
  if (!form) return;

  // Impede o comportamento padrão do navegador (que tentaria
  // navegar para o `action="/enviar"` e recarregar o documento,
  // destruindo a SPA no processo).
  evento.preventDefault();

  // Roda a validação customizada: cada campo inválido recebe uma
  // mensagem injetada no DOM (ver validacao.js) e a borda muda de
  // cor via classe CSS. O primeiro campo com problema recebe foco
  // automaticamente.
  if (!validarFormulario(form)) {
    return;
  }

  const botao = form.querySelector('button[type="submit"]');
  const textoOriginal = botao.textContent;

  // Estado de carregamento: desabilita o botão (aciona o CSS de
  // :disabled) e troca o texto, dando feedback imediato de que o
  // clique foi registrado.
  botao.disabled = true;
  botao.textContent = "Enviando...";

  // Simula uma chamada assíncrona (ex.: fetch para uma API) com
  // setTimeout. Numa versão com back-end real, este bloco seria
  // substituído por um fetch(form.action, { method: 'POST', ... })
  // dentro de um try/catch.
  setTimeout(() => {
    // Extrai os dados do formulário e grava no localStorage —
    // é aqui que o cadastro deixa de existir só "na tela" e passa
    // a sobreviver mesmo se a página for recarregada.
    const dados = extrairDadosFormulario(form);
    salvarCadastro(dados);

    const toast = document.getElementById("toast-sucesso-cadastro");
    if (toast) {
      toast.classList.add("mostrar");
      // Esconde o toast automaticamente depois de 4 segundos.
      setTimeout(() => toast.classList.remove("mostrar"), 4000);
    }

    form.reset(); // limpa todos os campos preenchidos
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }, 800);
});

// Quando o usuário clica em "Voltar" ou "Avançar" no navegador, o
// documento NÃO recarrega (afinal, ainda estamos na mesma página) —
// mas o evento "popstate" dispara, avisando que a URL mudou. É aqui
// que sincronizamos o conteúdo exibido com a nova URL.
window.addEventListener("popstate", () => {
  renderRoute(paraChaveDeRota(window.location.pathname), window.location.hash);
});

// Renderização inicial: assim que o script carrega, lê o caminho
// atual da barra de endereço e renderiza a rota correspondente —
// sem isso, o <main id="app"> ficaria vazio até o primeiro clique.
renderRoute(paraChaveDeRota(window.location.pathname), window.location.hash);
